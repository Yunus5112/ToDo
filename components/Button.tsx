import { forwardRef } from 'react';
import { Text, TouchableOpacity, TouchableOpacityProps, View } from 'react-native';

type ButtonProps = {
  title: string;
} & TouchableOpacityProps;

export const Button = forwardRef<View, ButtonProps>(
  ({ title, className, ...touchableProps }, ref) => {
    return (
      <TouchableOpacity ref={ref} {...touchableProps} className={className || styles.button}>
        <Text className={styles.buttonText}>{title}</Text>
      </TouchableOpacity>
    );
  }
);

const styles = {
  button: 'items-center bg-indigo-500 rounded-[12px] shadow-md px-4 py-3',
  buttonText: 'text-white text-base font-semibold text-center',
};

// Helper function to get button styles based on variant
export const getButtonStyles = (variant?: 'primary' | 'success' | 'danger') => {
  const baseStyles = 'items-center rounded-[12px] shadow-md px-4 py-3';

  switch (variant) {
    case 'success':
      return `${baseStyles} bg-green-500`;
    case 'danger':
      return `${baseStyles} bg-red-500`;
    case 'primary':
    default:
      return `${baseStyles} bg-indigo-500`;
  }
};
