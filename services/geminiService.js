const {GoogleGenerativeAI} = require("@google/generative-ai");
const logger = require('../utils/logger')
const {validateMeetingDetails} = require('../utils/validator');
const { GEMINI_API_KEY } = require("../config/config");

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const parseRequest =  async(text)=>{
    try{

        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            generationConfig:{
                maxOutputTokens:500,
                temperature:0.3
            }
        });
        const prompt =  `You are an executive assistant AI. Extract meeting details from this request:
    Return JSON with these fields: 
    - action: "schedule", "reschedule", or "cancel"
    - name: meeting name (string)
    - start: ISO 8601 datetime
    - end: ISO 8601 datetime
    - attendees: array of email strings
    - reminder: boolean (true if user requested reminder)
    - duration: meeting duration in minutes
    - location: "in-person" or "virtual"
    
    Input: ${text}
    
    Example response: 
    {
      "action": "schedule",
      "name": "Product Strategy Meeting",
      "start": "2025-08-15T14:00:00Z",
      "end": "2025-08-15T15:00:00Z",
      "duration": 60,
      "attendees": ["cto@company.com", "pm@company.com"],
      "reminder": true,
      "location": "virtual"
    }`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const jsonString = response.text().replace(/```json|```/g, '').trim();


    let meetingDetails;
    try{
        meetingDetails = JSON.parse(jsonString);
    }catch(parseError){
        logger.error(`JSON parse error: ${parseError.message}`);
        throw new Error("Failed to parse meeting details")
    }
    validateMeetingDetails(meetingDetails)

    }catch(error){

        logger.error("NLP Processing Failed 😭🥹🥹")
        throw new Error("Faild to process request wit AI 🙎‍♂️")
    }
};

module.exports = {
    parseRequest
}
