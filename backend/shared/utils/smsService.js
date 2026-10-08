import axios from 'axios';

/**
 * Send SMS using SMSIndiaHub API
 * @param {string} phone - Recipient phone number
 * @param {string} message - SMS content
 * @returns {Promise<any>}
 */
export const sendSMS = async (phone, message) => {
  const apiKey = process.env.SMSINDIAHUB_API_KEY;
  const senderId = process.env.SMSINDIAHUB_SENDER_ID;
  const templateId = process.env.SMSINDIAHUB_TEMPLATE_ID;

  // Clean phone number (standard 10-digit)
  let cleanPhone = phone.toString();
  if (cleanPhone.startsWith('+91')) {
    cleanPhone = cleanPhone.substring(3);
  } else if (cleanPhone.startsWith('91') && cleanPhone.length === 12) {
    cleanPhone = cleanPhone.substring(2);
  }

  try {
    // API URL for SMSIndiaHub (pushsms.aspx)
    const url = 'https://cloud.smsindiahub.in/vendorsms/pushsms.aspx';

    const params = {
      APIKey: apiKey,
      password: apiKey, // Some SMSIndiaHub endpoints require the API Key to be passed as 'password'
      user: process.env.SMSINDIAHUB_USERNAME,
      sid: senderId,
      msisdn: cleanPhone,
      msg: message,
      fl: 0,
      gwid: 2, // Gateway ID 2 for Transactional/OTP
    };

    if (templateId) {
      params.dltTemplateId = templateId;
      params.dlt_template_id = templateId;
      params.template_id = templateId;
      params.templateid = templateId;
      params.dlttemplateid = templateId;
    }
    if (process.env.SMSINDIAHUB_ENTITY_ID) {
      params.dltEntityId = process.env.SMSINDIAHUB_ENTITY_ID;
      params.dlt_entity_id = process.env.SMSINDIAHUB_ENTITY_ID;
      params.entityid = process.env.SMSINDIAHUB_ENTITY_ID;
      params.dltentityid = process.env.SMSINDIAHUB_ENTITY_ID;
    }

    console.log(`\n[SMS SERVICE] ----- SENDING SMS START -----`);
    console.log(`[SMS SERVICE] Username: ${process.env.SMSINDIAHUB_USERNAME}`);
    console.log(`[SMS SERVICE] Target: ${cleanPhone}`);
    console.log(`[SMS SERVICE] Message: ${message}`);
    console.log(`[SMS SERVICE] Sender ID: ${senderId}`);

    const response = await axios.get(url, { params });

    console.log(`[SMS SERVICE] API Response:`, JSON.stringify(response.data));
    console.log(`[SMS SERVICE] ----- SENDING SMS END -----\n`);

    return response.data;
  } catch (error) {
    console.error(`\n[SMS SERVICE] ERROR!`);
    console.error(`[SMS SERVICE] Phone: ${cleanPhone}`);
    console.error(`[SMS SERVICE] Error: ${error.message}`);
    if (error.response) {
      console.error(`[SMS SERVICE] Response Data:`, JSON.stringify(error.response.data));
    }
    console.error(`[SMS SERVICE] ----- SENDING SMS ERROR END -----\n`);
    throw error;
  }
};
