import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.kuberai.app',
  appName: 'Kuber.ai',
  webDir: 'out',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    Camera: {
      allowEditing: false,
      resultType: 'base64',
      saveToGallery: false,
    },
    SpeechRecognition: {
      // iOS/Android speech recognition
    },
  },
  // Background mode for voice
  backgroundColor: '#000000',
  ios: {
    contentInset: 'always',
    scheme: 'KuberAI',
  },
  android: {
    backgroundColor: '#000000',
  },
};

export default config;
