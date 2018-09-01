import React,{Component} from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {betterNumber} from '../helpers';
class HomeUploading extends Component{
  constructor(props)
  {
    super(props);

    this.state={
      data:null,
      startTime:new Date(),
      lastLoaded:0,
      event:null,
      speedUpload:0,
      loaded:0,
      total:0,
      percentage:0,
    }
  }
  componentDidMount()
  {

    const {data}=this.props;
    this.setState({
      data:data
    });
  }
  componentWillReceiveProps(nextProps)
  {
    const {event}=nextProps;
    console.log("getting an event of uploading",event);
    switch(_.get(event,'type')){

      case 'onUploadProgress':
        const loaded=_.get(event,'payload.loaded',0);
        const total=_.get(event,'payload.total',0);
        const percentage=total!==0?(loaded/total)*100:0;


        const currentTime=new Date();
        let diffTimeBetweenStartAndCurrent=currentTime-this.state.startTime

        if(diffTimeBetweenStartAndCurrent===0){
            diffTimeBetweenStartAndCurrent=1;
        }

        const speedPerOneMillosecond=(loaded-this.state.lastLoaded)/diffTimeBetweenStartAndCurrent;
        const speedPerSecond=speedPerOneMillosecond*1000;
        this.setState({
          speedUpload:speedPerSecond,
          startTime:currentTime,
          lastLoaded:loaded,
          loaded:loaded,
          total:total,
          percentage:percentage
        })
      break;

      default:
      break;
    }

  }
  render(){
    const {percentage,data,total,loaded,speedUpload}=this.state;
    const totalFiles=_.get(data,'files',[]).length;

    return(

      <div className={'app-card app-card-uploading'}>
        <div className={'app-card-content'}>
          <div className={'app-card-content-inner'}>
              <div className={'home-uploading'}>
                  <div className={'app-home-uploading-icon'}>
                  <i className={'icon-upload'} />
                  <h2>Sending...</h2>
                  </div>

                  <div className={'app-upload-files-total'}>Uploading {totalFiles} files</div>

                  <div className={'app-progress'}>
                      <span style={{width:`${percentage}%`}} className={'app-progress-bar'}></span>
                  </div>
                  <div className={'app-uploading-stats'}>
                  <div className={'app-uploading-stats-left'}>{betterNumber(loaded)} Bytes/{betterNumber(total)} Bytes</div>
                  <div className={'app-uploading-stats-right'}>{betterNumber(speedUpload)}/s</div>
                  </div>

                  <div className={'app-form-actions'}>
                      <button onClick={()=>{
                          if(this.props.onCancel){
                            this.props.onCancel(true);
                          }
                      }} className={'app-upload-cancel-button app-button'} type={'button'}>Cancel</button>
                  </div>
              </div>
          </div>
        </div>
      </div>

    );
  }
}
HomeUploading.propTypes={
  data:PropTypes.object,
  event:PropTypes.object,
  onCancel:PropTypes.func,
}
export default HomeUploading;
