import {type BeautyEffects} from 'customization-api';
import {
  useBeautyEffect,
  type BeautyProcessorType,
} from '../components/beauty-effect/useBeautyEffects';

export interface BeautyEffectInterface {
  applyBeautyEffect: (config: BeautyEffects) => void;
  removeBeautyEffect: () => void;
  beautyProcessor: BeautyProcessorType;
}

export const useBeautyEffects: () => BeautyEffectInterface = () => {
  const {applyBeautyEffect, removeBeautyEffect, beautyProcessor} =
    useBeautyEffect();

  // const beautyEffects = {
  //   lighteningContrastLevel,
  //   lighteningLevel,
  //   smoothnessLevel,
  //   sharpnessLevel,
  //   rednessLevel,
  // };

  return {
    applyBeautyEffect,
    removeBeautyEffect,
    beautyProcessor,
  };
};
