/**
 * Native Mobile Services Index
 * Exports all native iOS/Android integration services
 */

export { nativeCamera, NativeCameraService } from './camera';
export { nativeVoice, NativeVoiceService } from './voice';
export { dataService, DataService, db } from './data';
export { useKuberNativeAI } from './useKuberNativeAI';

export type { 
  ParchiImage, 
  ExtractedItem 
} from './camera';

export type { 
  VoiceConfig, 
  VoiceState 
} from './voice';

export type { 
  InventoryItem, 
  Order, 
  OrderItem, 
  UdharEntry 
} from './data';

export type { 
  NativeAIState, 
  UseKuberNativeAIReturn 
} from './useKuberNativeAI';
