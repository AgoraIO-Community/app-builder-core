// ES6 module syntax
import LocalizedStrings,{LocalizedStringsMethods} from 'react-localization';
// export interface IStrings extends LocalizedStringsMethods{
//   score:string;
//   time: String;
// }

// public strings: IStrings;
const strings = new LocalizedStrings({
 en:{
   how:"How do you want your egg today?",
   boiledEgg:"Boiled egg",
   softBoiledEgg:"Soft-boiled egg",
   choice:"How to choose the egg"
 },
 it: {
   how:"Come vuoi il tuo uovo oggi?",
   boiledEgg:"Uovo sodo",
   softBoiledEgg:"Uovo alla coque",
   choice:"Come scegliere l'uovo"
 }
});
const setLanguage = (languageCode: string) => strings.setLanguage(languageCode);
export {
  setLanguage
}
export default strings