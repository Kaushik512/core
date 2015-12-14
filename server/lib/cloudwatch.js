var aws = require('aws-sdk');
var logger = require('_pr/logger')(module);


if (process.env.http_proxy) {
    aws.config.update({
        httpOptions: {
            proxy: process.env.http_proxy
        }
    });
}

// var cloudwatch = new AWS.CloudWatch();
// cloudwatch.deleteAlarms(params, function (err, data) {
//   if (err) console.log(err, err.stack); // an error occurred
//   else     console.log(data);           // successful response
// });

var CW = function(awsSettings) {
    var cloudwatch = new aws.CloudWatch({
        "accessKeyId": awsSettings.access_key,
        "secretAccessKey": awsSettings.secret_key,
        "region": awsSettings.region
    });
    var date = new Date();
    //var last = new Date(date.getHours());
    var last = new Date(date.getTime() -(1000*60*60*6+(1000*60*30)));
    //var date1 = new Date(date.getTime() -(1000*60*60*24));
    var last1 = new Date(date.getTime() -(1000*60*60*24));
    var params = {
      EndTime: date,
      /* required */
      MetricName: 'EstimatedCharges',
      /* required */
      Namespace: 'AWS/Billing',
      /* required */
      Period: 86400,
      /* required */
      StartTime: last,
      /* required */
      Statistics: [ /* required */
          'Maximum'
          /* more items */
      ],
      Dimensions: [
          /**    {
                   Name: 'ServiceName', 
                   Value: 'AmazonEC2'
                 },**/
          {
              Name: 'LinkedAccount',
              Value: '549974527830'
          }, {
              Name: 'Currency',
              Value: 'USD'
          }
      ],
    };
    var params1 = {
      EndTime: date,
      /* required */
      MetricName: 'EstimatedCharges',
      /* required */
      Namespace: 'AWS/Billing',
      /* required */
      Period: 86400,
      /* required */
      StartTime: last1,
      /* required */
      Statistics: [ /* required */
          'Minimum'
          /* more items */
      ],
      Dimensions: [
          /**    {
                   Name: 'ServiceName', 
                   Value: 'AmazonEC2'
                 },**/
          {
              Name: 'LinkedAccount',
              Value: '549974527830'
          }, {
              Name: 'Currency',
              Value: 'USD'
          }
      ],
    };
    this.getTotalCost = function(callback){
        cloudwatch.getMetricStatistics(params,function(err,data){
            if(err){
                logger.debug("Error occurred for listing aws instances: ",err);
                callback(err,null);
            }else{
                logger.debug("Able to list all aws maximum instances: ");
                //logger.debug(JSON.stringify(data));
                callback(null,data.Datapoints[0].Maximum);
            }
        });
    };
    this.getTotalCostYesterday = function(callback){
        cloudwatch.getMetricStatistics(params1,function(err,data1){
            if(err){
                logger.debug("Error occurred for listing aws instances: ",err);
                callback(err,null);
            }else{
                logger.debug("Able to list all aws minimum instances: ");
                //logger.debug(JSON.stringify(data1));
                callback(null,data1.Datapoints[0].Minimum);
            }
        });
    };


   //  this.getMetricStatistics = function( function(err, data) {
   //    if (err) console.log(err, err.stack); // an error occurred
   //    else
   //       //console.log("cost job for now"+data.Datapoints[0].Maximum);
   //       //day_cost= data.Datapoints[0].Maximum;
   //       callback(null,data);

   //       //var cost_month = 1200;
   //        // send_event('cost_month',{current:month_cost,last:cost_month});    // successful response
   //        // send_event('cost_plan',{current:cost_month});
   // });

    // var that = this;

    // this.listInstances = function(callback){
    //     ec.describeInstances(function(err,instances){
    //         if(err){
    //             logger.debug("Error occurred for listing aws instances: ",err);
    //             callback(err,null);
    //         }else{
    //             logger.debug("Able to list all aws instances: ");
    //             callback(null,instances);
    //         }
    //     });
    // };


    // this.describeInstances = function(instanceIds, callback) {
    //     logger.debug('fetching instances for ==>',instanceIds);
    //     var options = {};

    //     if (instanceIds && instanceIds.length) {
    //         options.InstanceIds = instanceIds;
    //     } else {
    //         options.MaxResults = 1000;
    //     }
    //     ec.describeInstances(options, function(err, data) {
    //         if(err){
    //             logger.debug("Got instanceState info with error: ",err);
    //             callback(err,null);
    //         }
    //         logger.debug("Got instanceState info: ",JSON.stringify(data));
    //         callback(null, data);
    //     });
    // };
}

module.exports = CW;