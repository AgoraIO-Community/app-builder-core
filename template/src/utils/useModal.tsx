import {useState} from 'react';

export function useModal(initialMode = false) {
  const [modalOpen, setModalOpen] = useState(initialMode);
  const toggle = () => setModalOpen(!modalOpen);

  return {modalOpen, setModalOpen, toggle};
}
