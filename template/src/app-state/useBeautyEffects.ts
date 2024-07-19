import {type BeautyEffects} from 'customization-api';
import {useBeautyEffect} from '../components/beauty-effect/useBeautyEffects';
import {isWeb} from '../utils/common';

export interface BeautyEffectInterface {
  isBeautyEffectsON: boolean;
  beautyEffects: BeautyEffects;
  applyBeautyEffect: (config: BeautyEffects) => void;
  removeBeautyEffect: () => void;
}

export const useBeautyEffects: () => BeautyEffectInterface = () => {
  const {
    rednessLevel,
    lighteningContrastLevel,
    lighteningLevel,
    smoothnessLevel,
    sharpnessLevel,
    applyBeautyEffect,
    removeBeautyEffect,
    beautyEffectsOn,
  } = useBeautyEffect();

  const beautyEffects = {
    lighteningContrastLevel,
    lighteningLevel,
    smoothnessLevel,
    sharpnessLevel,
    rednessLevel,
  };

  return {
    isBeautyEffectsON: beautyEffectsOn,
    beautyEffects,
    applyBeautyEffect,
    removeBeautyEffect,
  };
};
