#!/usr/bin/env python3
"""Check 64-bit ELF/APK alignment and shared Agora AOSL symbol compatibility."""
import argparse
import struct
import sys
import zipfile
from pathlib import Path

PAGE_SIZE = 16384


def aosl_symbols(data):
    """Read required and exported AOSL symbols from ELF32/ELF64 dynamic tables."""
    if data[:4] != b'\x7fELF':
        raise ValueError('expected an ELF library')
    is_64 = data[4] == 2
    endian = '<' if data[5] == 1 else '>'
    table_offset = struct.unpack_from(endian + ('Q' if is_64 else 'I'), data, 40 if is_64 else 32)[0]
    entry_size, entry_count = struct.unpack_from(endian + 'HH', data, 58 if is_64 else 46)
    section_format = endian + ('IIQQQQIIQQ' if is_64 else 'IIIIIIIIII')
    sections = [struct.unpack_from(section_format, data, table_offset + i * entry_size)
                for i in range(entry_count)]
    required, exported = set(), set()
    for section in sections:
        if section[1] != 11:  # SHT_DYNSYM
            continue
        strings = sections[section[6]]
        string_data = data[strings[4]:strings[4] + strings[5]]
        for offset in range(section[4], section[4] + section[5], section[9]):
            symbol = struct.unpack_from(endian + ('IBBHQQ' if is_64 else 'IIIBBH'), data, offset)
            name_offset = symbol[0]
            name_bytes = string_data[name_offset:string_data.find(b'\0', name_offset)]
            if not name_bytes.startswith(b'aosl_'):
                continue
            name = name_bytes.decode('ascii')
            info, section_index = (symbol[1], symbol[3]) if is_64 else (symbol[3], symbol[5])
            if section_index == 0:
                if info >> 4 == 1:  # Undefined GLOBAL symbols; WEAK imports are optional.
                    required.add(name)
            elif info >> 4 in (1, 2):
                exported.add(name)
    return required, exported


def check_artifact(path):
    failures = []
    checked = 0
    aosl_providers = {}
    aosl_consumers = []
    with zipfile.ZipFile(path) as archive, path.open('rb') as artifact:
        for entry in archive.infolist():
            name = entry.filename
            if name.endswith('.so'):
                data = archive.read(entry)
                required, exported = aosl_symbols(data)
                abi = name.split('/')[-2]
                if name.endswith('/libaosl.so'):
                    aosl_providers[abi] = exported
                if required:
                    aosl_consumers.append((name, abi, required))
            if not name.endswith('.so') or not any(
                f'/{abi}/' in name for abi in ('arm64-v8a', 'x86_64')
            ):
                continue
            checked += 1
            data = archive.read(entry)
            if data[:5] != b'\x7fELF\x02':
                failures.append(f'{name}: expected a 64-bit ELF library')
                continue
            endian = '<' if data[5] == 1 else '>'
            table_offset = struct.unpack_from(endian + 'Q', data, 32)[0]
            entry_size, entry_count = struct.unpack_from(endian + 'HH', data, 54)
            for index in range(entry_count):
                offset = table_offset + index * entry_size
                segment_type = struct.unpack_from(endian + 'I', data, offset)[0]
                if segment_type == 1:  # PT_LOAD
                    alignment = struct.unpack_from(endian + 'Q', data, offset + 48)[0]
                    if alignment < PAGE_SIZE:
                        failures.append(f'{name}: ELF load segment is aligned to {alignment} bytes')
                        break
            if path.suffix == '.apk' and entry.compress_type == zipfile.ZIP_STORED:
                artifact.seek(entry.header_offset + 26)
                name_size, extra_size = struct.unpack('<HH', artifact.read(4))
                data_offset = entry.header_offset + 30 + name_size + extra_size
                if data_offset % PAGE_SIZE:
                    failures.append(f'{name}: uncompressed APK entry lacks 16 KB ZIP alignment')
    if not checked:
        failures.append('No 64-bit native libraries found')
    for name, abi, required in aosl_consumers:
        missing = required - aosl_providers.get(abi, set())
        if missing:
            failures.append(f'{name}: packaged libaosl.so lacks symbols: {", ".join(sorted(missing))}')
    for failure in failures:
        print(f'FAIL: {failure}', file=sys.stderr)
    print(f'{path.name}: checked alignment of {checked} native libraries and '
          f'AOSL imports in {len(aosl_consumers)} libraries; {len(failures)} failures')
    if path.suffix == '.aab':
        print('AAB check covers ELF alignment. Also verify ZIP alignment in generated APKs.')
    return bool(failures)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('artifact', type=Path)
    args = parser.parse_args()
    sys.exit(check_artifact(args.artifact))
