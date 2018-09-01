import React, {Component} from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {history} from '../history';
class HomeUploadSent extends Component{

  constructor(props)
  {
    super(props);
  }
  render(){
    const {data}=this.props;
    const to=_.get(data,'to');
    const postId=_.get(data,'_id');
    return(
      <div className={'app-card app-card-upload-sent'}>
        <div className={'app-card-content'}>
          <div className={'app-card-content-inner'}>
              <div className={'home-uploading'}>
                  <div className={'app-home-upload-sent-icon'}>
                  <i className={'icon-paper-plane'} />
                  </div>
                  <div className={'app-upload-sent-message app-text-center'}>
                    <h2>Files Sent!</h2>
                    <p>We have sent an email to {to} with a download link. The link will expire in 30 days</p>
                  </div>

                  <div className={'app-upload-sent-actions app-form-actions'}>
                    <button onClick={()=>{

                    history.push(`/share/${postId}`);  
                    }} className={'app-button primary'} type={'button'}>View files</button>
                    <button onClick={(event)=>{
                      if(this.props.onSentAnotherFile){

                        this.props.onSentAnotherFile(true);

                      }
                    }} className={'app-button app-button-primary'} type={'button'}>Send more files</button>
                  </div>
              </div>
          </div>
        </div>
      </div>

    );

  }
}

HomeUploadSent.propTypes={
  data:PropTypes.object,
  onSentAnotherFile:PropTypes.func
};
export default HomeUploadSent;
