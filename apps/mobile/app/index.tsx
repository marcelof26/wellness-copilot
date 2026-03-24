import { Redirect } from 'expo-router';
import { useAppStore } from '../src/store';

export default function Index() {
  const { userId } = useAppStore();
  return <Redirect href={userId ? '/(tabs)/copilot' : '/(auth)/login'} />;
}
