var properties    = PropertiesService.getScriptProperties();
var botOAuthToken = properties.getProperty('bot_oauth_token');
var slackApp      = SlackApp.create(botOAuthToken);

var s3BucketName  = properties.getProperty('s3_bucket_name');
var s3FolderName  = properties.getProperty('s3_folder_name');

/**
 * メイン処理
 *
 * @param object e
 * @return void
 */
function doPost(e) {
  const verifiedToken = properties.getProperty('verified_token');
  const token         = e.parameter.token;
  if (verifiedToken !== token) {
    throw new Error("invalid token.");
  }

  callByTwilio();
  postMessageToSlack(e.parameter.channel_name);
}

/**
 * Twilioを使って電話をかける
 *
 * @return void
 */
function callByTwilio() {
  const phoneNumber       = properties.getProperty('phone_number');
  const twilioPhoneNumber = properties.getProperty('twilio_phone_number');
  const twilioSid         = properties.getProperty('twilio_sid');
  const twilioToken       = properties.getProperty('twilio_token');

  const payload = {
    'Method'  : 'GET', // S3の場合、明示的に指定する必要あり
    'To'      : phoneNumber,
    'From'    : twilioPhoneNumber,
    'Url'     : 'https://' + s3BucketName + '.s3-ap-northeast-1.amazonaws.com/' + s3FolderName + '/TwiML.xml',
    'Timeout' : '60'
  };

  const url     = 'https://api.twilio.com/2010-04-01/Accounts/' + twilioSid + '/Calls.json';
  const paramas = {
    'method'  : 'POST',
    'headers' : {
      'Authorization' : 'Basic ' + Utilities.base64Encode(twilioSid + ':' + twilioToken)
    },
    'payload' : payload,
    'muteHttpExceptions' : true
  };
  
  UrlFetchApp.fetch(url, paramas);
}

/**
 * Slackにメッセージを送る
 *
 * @param string channel
 * @return void
 */
function postMessageToSlack(channel) {
  if (!channel) {
    return;
  }

  slackApp.postMessage(channel, 'おはよう、ねむいー。今起こしてあげるね！', {
    username: '広瀬すず',
    icon_url: 'https://' + s3BucketName + '.s3-ap-northeast-1.amazonaws.com/' + s3FolderName + '/hirose_suzu.jpg'
  });
}
