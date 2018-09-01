import _ from 'lodash';

const KB=1024;
const MB=KB*KB;
export const betterNumber=(input,round=true)=>{
  if(input>KB){
    return round ? `${_.round(input/KB)} K`:`${(input/KB)} K`;
  }

  if(input>MB){
    return round ? `${_.round(input/MB)} M`:`${(input/MB)} M`;
  }
}
