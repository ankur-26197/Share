import {version} from '../package.json';
import path from 'path';
import _ from 'lodash';
import File from './models/file';
import {ObjectID} from 'mongodb';
import Post from './models/post';
import FileArchiver from './archiver';
import Email from './email';
class AppRouter{
  constructor(app)
  {
    this.app=app;
    this.setupRouters();
  }


  setupRouters(){
    const app=this.app;
    const db=app.get('db');
    app.get('/', (req, res, next) => {

            return res.status(200).json({
                version: version
            });

        });

        const uploadDir=app.get('storageDir');
        const upload=app.get('upload');
        app.post('/api/upload',upload.array('files'), (req, res, next) => {
            const files=_.get(req,'files',[]);
            let fileModels=[];

            _.each(files,(fileObject)=>{
              const newFile=new File(app).initWithObject(fileObject).toJSON();
              fileModels.push(newFile);
            });
            if(fileModels.length)
            {
              db.collection('files').insertMany(fileModels,(err,result)=>{
                if(err)
                {
                  return res.status(503).json({
                    error:{
                      message:"unable to save your file",
                    }
                  });
                }
                let post=new Post(app).initWithObject({
                  from:_.get(req,'body.from'),
                  to:_.get(req,'body.to'),
                  message:_.get(req,'body.message'),
                  files:result.insertedIds
                }).toJSON();

                db.collection('posts').insertOne(post,(err,result)=>{
                  if(err)
                  {
                    return res.status(503).json({error:{message:'upload could not be saved'}});
                  }

                  const sendEmail = new Email(app).sendDownloadLink(post, (err, info) => {


                       });
                  return res.json(post);
                });
                });


            }else{
              return res.status(503).json({
                error:{message:"file upload is required"}
              });
            }

          });

      app.get('/api/download/:id',(req,res,next)=>{
        const fileId=req.params.id;
        console.log(fileId);
        db.collection('files').find({_id:ObjectID(fileId)}).toArray((err,result)=>{
          const fileName=_.get(result,'[0].name');
          if(err || !fileName)
          {
            return res.status(404).json({
              error:{
                message:"file not found",
              }
            })

          }


          const filePath=path.join(uploadDir,fileName);
          return res.download(filePath,_.get(result,'[0].originalName'),(err)=>{
            if(err)
            {
              return res.status(404).json({
                error:{
                  message:'filenot found',
                }
              });
            }else{
              console.log("file downloaded");
            }
          });
        });

      });

    console.log("the app is routing");

    app.get('/api/posts/:id',(req,res,next)=>{

      const postId=_.get(req,'params.id');
      this.getPostById(postId,(err,result)=>{

        if(err){
          return res.status(404).json({errror:{message:'File not found'}});
        }
        return res.json(result);
      })
    });

    app.get('/api/posts/:id/download',(req,res,next)=>{

      const id=_.get(req,'params.id',null);

    this .getPostById(id,(err,result)=>{
      if(err){
        return res.status(404).json({errror:{message:'File not found'}});
      }
      const files=_.get(result,'files','[]');
      const archiver=new FileArchiver(app,files,res).download();
      return archiver;
    });
    });


  }
  getPostById(id,callback = ()=> {}){

    const app=this.app;
    const db=app.get('db');
    let postObjectId=null;
    try{
      postObjectId=new ObjectID(id);
    }
    catch(err){
      return callback(err,null);
    }

    db.collection('posts').find({_id:postObjectId}).limit(1).toArray((err,results)=>{
      let result=_.get(results,'[0]');

      if(err||!result){
        return callback(err ? err : new Error("File not found"));
      }
      const fileIds=_.get(result,'files',[]);
      db.collection('files').find({_id:{$in:fileIds}}).toArray((err,files)=>{
        if(err||!files||!files.length)
        {
          return callback(err ? err : new Error("File not found"));
        }
        result.files=files;
        return callback(null,result);

      })

    });

  }
}
export default AppRouter;
