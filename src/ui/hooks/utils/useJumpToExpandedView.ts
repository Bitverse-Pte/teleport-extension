import { useHistory } from 'react-router-dom';
import { useLocation } from 'react-use';

export function useJumpToExpandedView() {
  const location = useLocation();
  const history = useHistory();
  const fn = (path: string) => {
    if (location.pathname === '/index.html') {
      history.push(path);
    } else {
      return window.open(`index.html#${path}`);
    }
  };
  return fn;
}
