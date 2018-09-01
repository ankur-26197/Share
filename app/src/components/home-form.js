import React,{Component} from 'react';
import _ from 'lodash';
import classNames from 'classnames';
import {upload} from '../helpers/upload';
import PropTypes from 'prop-types';
class HomeForm extends Component
{
  constructor(props)
  {
    super(props);
    this.state={
      form:{
        files:[],
        to:'',
      from:'',
      message:''
    },

        errors:{
          to:null,
          from:null,
          files:null
        }
    };
    this._formValidation=this._formValidation.bind(this);
    this._onFileRemove=this._onFileRemove.bind(this);
  }

 _onFileRemove(key){
   let {files}=this.state.form;
   files.splice(key,1);
   this.setState({
     form:{
       ...this.state.form,
       files:files
     }
   })
 }
  _onFileAdded(event)
  {
     let files=this.state.form.files;

     _.each(_.get(event,'target.files'),(file)=>{
       files.push(file);
     });
     console.log("files added",files);
     this.setState({
       form:{
         ...this.state.form,
         files:files,
       }
     },()=>{
       this._formValidation(['files'],(isValid)=>{

       });
     });
  }

  _isEmail(emailAddress)
  {
    const emailRegex=/^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
    return emailRegex.test(emailAddress);
  }
  _onTextChange(event){
    let {form}=this.state;
    const fieldName=event.target.name;
    const fieldValue=event.target.value;
    form[fieldName]=fieldValue;

    this.setState({form:form});
  }
  _formValidation(fields=[],callback=()=>{})
  {
    let {form,errors}=this.state;
    const validations={

      from:[
        {
          errorMessage: 'From is required.',
          isValid: ()=>{
            return form.from.length;
          }

        },

        {
          errorMessage: 'Email is not valid.',
          isValid: ()=>{
            return this._isEmail(form.from);
          }

        },

      ],

      to:[
        {
          errorMessage: 'To is required.',
          isValid: ()=>{
            return form.to.length;
          }

        },

        {
          errorMessage: 'Email is not valid.',
          isValid: ()=>{
            return this._isEmail(form.to);
          }

        },

      ],
      files:[
        {
          errorMessage:'File is required.',
          isValid:()=>{
            return form.files.length;
          }
        }
      ]

    }

    _.each(fields,(field)=>{

      let fieldValidations=_.get(validations,field,[]);
      errors[field]=null;
      _.each(fieldValidations,(fieldValidation)=>{
        const isValid=fieldValidation.isValid();
        if(!isValid)
        {
          errors[field]=fieldValidation.errorMessage;
        }
      });
    });


    this.setState({
      errors:errors
    },()=>{

        let isValid=true;
        _.each(errors,(err)=>{
          if(err!=null){
            isValid=false;
          }
        });
        return callback(isValid);
    })
  }
  _onSubmit(event){
    event.preventDefault();
    this._formValidation(['from','to','files'],(isValid)=>{
      if(isValid)
      {
        const data=this.state.form;
          if(this.props.onUploadBegin){
            this.props.onUploadBegin(data);
          }
          upload(data,(event)=>{
            if(this.props.onUploadEvent)
            {
              this.props.onUploadEvent(event);
            }
          })
      }
    });

  }
  render(){

    const {form,errors}=this.state;
    console.log(form.files.length);
    const {files}=form;
    return(
      <div className={'app-card'}>
          <form onSubmit={this._onSubmit.bind(this)}>
          <div className={'app-card-header'}>
              <div className={'app-card-header-inner'}>
              {

                files.length ? <div className={'app-files-selected'}>
                  {
                    files.map((file,index)=>{
                      return(
                        <div key={index} className={'app-files-selected-item'}>
                        <div className={'filename'}>{file.name}</div>

                        <div className={'file-action'}><button type={'button'} onClick ={()=>this._onFileRemove(index)} className={'app-file-remove'}>x</button></div>
                        </div>
                      )
                    })
                  }
                </div>:null

              }

                <div className={classNames('app-file-select-zone',{'error':_.get(errors,'files')})}>
                  <label>
                      <input onChange={this._onFileAdded.bind(this)} id={'input-file'} type="file" multiple={true} />
                    {
                      files.length ?  <span className={'app-upload-description text-uppercase'}>Add more files</span>:
                      <span>
                      <span className={'app-upload-icon'}><i className={'icon-picture-o'} /></span>
                      <span className={'app-upload-description'}>Drag and drop your files here.</span>
                      </span>
                    }
                  </label>
                  </div>
              </div>
          </div>
          <div className={'app-card-content'}>
              <div className={'app-card-content-inner'}>
                  <div className={classNames('app-form-item',{'error':_.get(errors,'to')})}>
                    <label>Send to</label>
                    <input value={form.to} onChange={this._onTextChange.bind(this)} name={'to'} placeholder={_.get(errors,'to')?_.get(errors,'to'):'Email address'} type={'text'}id={'to'} />
                  </div>

                  <div className={classNames('app-form-item',{'error':_.get(errors,'from')})}>
                    <label>From</label>
                    <input onChange={this._onTextChange.bind(this)} name={'from'} placeholder={_.get(errors,'from')?_.get(errors,'from'):'Your email address'} type={'text'}id={'from'} />
                  </div>

                  <div className={'app-form-item'}>
                    <label>Message</label>
                    <textarea  onChange={this._onTextChange.bind(this)} placeholder={'Add a note (optional)'} id={'message'} name={'message'} />
                  </div>

                  <div className={'app-form-actions'}>
                      <button type={'submit'} className={'app-button primary'}>Send</button>
                  </div>
              </div>
          </div>
          </form>
      </div>
    )
  }
}


HomeForm.propTypes={
  onUploadBegin:PropTypes.func,
  onUploadEvent:PropTypes.func
};
export default HomeForm;
