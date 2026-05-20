declare module 'react-native-vector-icons/Ionicons' {
  import * as React from 'react';
  import { TextProps } from 'react-native';

  export interface IconProps extends TextProps {
    name: string;
    size?: number;
    color?: string;
  }

  const Ionicons: React.ComponentType<IconProps>;
  export default Ionicons;
}