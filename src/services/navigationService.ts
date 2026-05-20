import { createNavigationContainerRef } from '@react-navigation/native';
import type { RootStackParamList } from '../navigation/types';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export const isNavigationReady = () => navigationRef.isReady();

export const navigateRoot = (name: keyof RootStackParamList, params?: RootStackParamList[keyof RootStackParamList]) => {
  if (!navigationRef.isReady()) {
    return;
  }

  navigationRef.navigate(name as never, params as never);
};
