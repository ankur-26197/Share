import archiver from 'archiver';
import _ from 'lodash';
import path from 'path';
export default class FileArchiver{

  constructor(app,files=[],response)
  {
    this.app=app;
    this.files=files;
    this.response=response;
  }
  download(){
    const app=this.app;
    const files=files;
    const uploadDir=app.get('storageDir');
    const response=this.response;
    const zip=archiver('zip');
    response.attachment('download.zip');
    zip.pipe(response);


    _.each(files,(file)=>{
      const filePath=path.join(uploadDir,_.get(file,'name'));
      zip.file(path,{name:_.get(file,'originalName')});
    })
    zip.finalize();

    return this;
  }
}
