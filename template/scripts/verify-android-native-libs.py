#!/usr/bin/env python3
"""Check 64-bit native ELF alignment in an APK or AAB, and APK ZIP alignment."""
import argparse
import struct
import sys
import zipfile
from pathlib import Path

PAGE_SIZE = 16384


def check_artifact(path):
    failures = []
    checked = 0
    with zipfile.ZipFile(path) as archive, path.open('rb') as artifact:
        for entry in archive.infolist():
            name = entry.filename
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
    for failure in failures:
        print(f'FAIL: {failure}', file=sys.stderr)
    print(f'{path.name}: checked {checked} native libraries; {len(failures)} alignment failures')
    if path.suffix == '.aab':
        print('AAB check covers ELF alignment. Also verify ZIP alignment in generated APKs.')
    return bool(failures)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('artifact', type=Path)
    args = parser.parse_args()
    sys.exit(check_artifact(args.artifact))
