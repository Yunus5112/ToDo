import React from 'react';
import { Text, View } from 'react-native';
import { Button } from './Button';

type Props = {
  children: React.ReactNode;
};

type State = { hasError: boolean; error?: unknown };

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: unknown): State {
    return { hasError: true, error };
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View className="flex-1 items-center justify-center gap-4 p-6">
          <Text className="text-lg font-semibold">Something went wrong</Text>
          <Button title="Try again" onPress={this.handleRetry} />
        </View>
      );
    }
    return this.props.children as any;
  }
}


