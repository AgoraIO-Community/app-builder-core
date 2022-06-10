import {useHistory} from '../components/Router';

export default function useNavigateTo() {
  const history = useHistory();
  return (path: string, params?: any) => {
    history.push(path, params);
  };
}
