import { createPageUrl } from '@/utils';

export default function App() {
  window.location.href = createPageUrl('Dashboard');
  return null;
}