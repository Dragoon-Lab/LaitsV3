/** Convenience functions for generating common logging messages for an 
    intelligent tutoring system or adaptive learning system
    
    Package: SuperGLU (Generalized Learning Utilities)
    Author: Benjamin Nye
    License: APL 2.0
    
    Requires:
        - Util\uuid.js 
        - Util\zet.js 
        - Util\serializable.js
        - Core\messaging.js
        - Core\messaging-gateway.js
**/

if (typeof SuperGLU === "undefined"){
    var SuperGLU = {};
    if (typeof window === "undefined") {
        var window = this;
    }
    window.SuperGLU = SuperGLU;
}

(function(namespace, undefined) {
// External Modules
var Zet = SuperGLU.Zet,
    Serialization = SuperGLU.Serialization,
    Messaging = SuperGLU.Messaging,
    Messaging_Gateway = SuperGLU.Messaging_Gateway,
// External Classes
    Message = SuperGLU.Messaging.Message;

// Operational Verbs
var LOADED_VERB = "Loaded";
    
// Task Performance Verbs
var COMPLETED_VERB = 'Completed',                       // Finished task, return result (e.g., score)
    COMPLETED_ALL_STEPS_VERB = 'CompletedAllSteps',     // Completed all steps (true/false/% steps completed)
    COMPLETED_STEP_VERB = 'CompletedStep',              // Completed a given task step
    KC_SCORE_VERB = 'KnowledgeComponentScore';          // A score for a KC (e.g., performance on a given task)

// Task Adaptive Support Verbs
var TASK_HELP_VERB = 'TaskHelp',                        // User received some other type of help on a task
    TASK_HINT_VERB = 'TaskHint',                        // User received a hint (e.g., next step) on a task
    TASK_FEEDBACK_VERB = 'TaskFeedback',                // User received reactive feedback (e.g., error correction, approval)
    TASK_DECOMPOSITION_VERB = 'TaskDecomposition';      // User received a decomposed task (i.e., broken into subtasks)
    
// Task User Input Verbs
var PRESENTED_VERB = 'Presented',                       // User was presented with some element
    SELECTED_OPTION_VERB = 'SelectedOption',            // User selected some option or element
    SUBMITTED_ANSWER_VERB = 'SubmittedAnswer',          // An answer submitted by a user
    MISCONCEPTION_VERB = 'Misconception',               // User demonstrated a specific bug or misconception
    TASK_SUPPORT_VERB = 'TaskSupport',                  // Overall level of support given to the user during task
    TASK_HELP_COUNT_VERB = 'TaskHelpCount';             // Overall number of hints user received during the task.
 
// Peripheral Metrics Verbs - Calculated by Task
var WORDS_PER_SECOND_VERB = 'WordsPerSecond',           // # Words per second, for text-input interactions (e.g., natural language ITS)
    ACTIONS_PER_SECOND_VERB = 'ActionsPerSecond',       // # Actions per second (e.g., selecting choices, attempting to answer) 
    ANSWER_SEMANTIC_MATCH_VERB = 'AnswerSemanticMatch', // Match of an answer for the user to some ideal(s)
    PERSISTENCE_VERB = 'Persistence',                   // Metric for persistence (e.g., continuing despite failure)
    IMPETUOUSNESS_VERB = 'Impetuousness',               // Metric for impetuousness (e.g., answering overly quickly, carelessness)
    GAMING_SYSTEM_VERB = 'GamingTheSystem',             // Metric for gaming the system (e.g., hint abuse)
    WHEELSPINNING_VERB = 'WheelSpinning',               // Metric for wheel spinning (e.g., continued failure on similar skills w/o improvement)
    CONFUSION_VERB = 'Confusion',                       // Metric for confusion (e.g., moderate delays, poor answer cohesion, video metrics)
    DISENGAGEMENT_VERB = 'Disengagement',               // Metric for disengagement (e.g., long delays, inattentive gaze, leaning back in chair)
    MASTERY_VERB = 'Mastery';

// Context Keys
var USER_ID_KEY = 'userId',                             // Unique identifier for the user
    DURATION_KEY = 'duration',                          // Duration spent on the task, 
    TASK_ID_KEY = 'taskId',                             // ID for the task being performed
    STEP_ID_KEY = 'stepId',                             // Unique ID for the current step or state.
    ACTIVITY_TYPE_KEY = 'activityType',                 // Type of activity being performed
    KC_RELEVANCE_KEY = 'KCRelevance',                   // Knowledge component relevance
    HELP_TYPE_KEY = 'helpType',                         // Type of the help provided (e.g., Positive, Negative, neutral)
    RESULT_CONTENT_TYPE_KEY = 'resultContentType';      // Type for the content of the help or other media (e.g., 'text', 'html', 'jpg')     
    
// Other Constants
var UNKNOWN_PREFIX = 'Unknown',
    POSITIVE_HELP_TYPE = 'Positive',
    NEUTRAL_HELP_TYPE = 'Neutral',
    NEGATIVE_HELP_TYPE = 'Negative';
 
/** ITS Logging service, for sending learning-relevant messages **/
Zet.declare('StandardITSLoggingService', {
    superclass : Messaging_Gateway.BaseService,
    defineBody : function(self){
		// Public Properties

        /** Initialize the heartbeat service 
            @param gateway: The parent gateway for this service
            @param heartbeatName: The name for the heartbeat
            @param delay: The interval for sending the heartbeat, in seconds.
            @param id: The UUID for this service
        **/
        self.construct = function construct(gateway, userId, taskId, url, activityType, context, id){
            self.inherited(construct, [id, gateway]);
            if (userId == null){userId = UUID.genV4().toString();}
            if (taskId == null){taskId = UNKNOWN_PREFIX + '_' + window.location.href;}
            if (url == null){url = window.location.href;}
            if (activityType == null){activityType = '';}
            if (context == null){context = {};}
            self._userId = userId;
            self._taskId = taskId;
            self._url = url;
            self._activityType = activityType;
            self._context = context;
            self._startTime = new Date();
		};
        
        /** Calculate the duration so far **/
        self.calcDuration = function calcDuration(startTime){
            if (startTime == null){startTime = self._startTime;}
            var duration = ((new Date()).getTime() - startTime.getTime())/1000.0;
            if (duration < 0){
                console.log("Warning: Calculated duration was less than zero.");
            }
            return duration;
        };
        
        /** Reset the start time for this service, for the purpose of calculating the duration **/
        self.resetStartTime = function resetStartTime(startTime){
            if (startTime == null){startTime = new Date();}
            self._startTime = startTime;
        };
        
        self.resetTaskId = function resetTaskId(taskId){ 
           if (taskId == null){taskId = UNKNOWN_PREFIX + '_' + window.location.href;}
           self._taskId = taskId;
        };
    
        /** Add context to the message **/
        self.addContext = function addContext(msg, context){
            var key;
            msg.setContextValue(USER_ID_KEY, self._userId);
            msg.setContextValue(TASK_ID_KEY, self._taskId);
            msg.setContextValue(ACTIVITY_TYPE_KEY, self._activityType);  
            msg.setContextValue(DURATION_KEY, self.calcDuration());     
            for (key in self._context){
                if (!(msg.hasContextValue(key))){
                    msg.setContextValue(key, self._context[key]);
                }
            }
            for (key in context){
                if (!(msg.hasContextValue(key))){
                    msg.setContextValue(key, context[key]);
                }
            }
            return msg;
        };
        
        /** Finalize any post-processing of the message and send it **/
        self.sendLoggingMessage = function sendLoggingMessage(msg, context){
            msg = self.addContext(msg, context);
            self.sendMessage(msg);
        };
        
        /********************************
         **  LOG MESSAGE GENERATORS    **
         ********************************/

        /** Send the task completed message **/
        self.sendLoadedTask = function sendLoadedTask(frameName){
            if (frameName == null){frameName = window.name;}
            var msg = Message(frameName, LOADED_VERB, self._url, true);
            self.sendLoggingMessage(msg);
        };         
 
        /** Send the task completed message **/
        self.sendCompletedTask = function sendCompletedTask(score){
            score = self.clampToUnitValue(score);
            var msg = Message(self._userId, COMPLETED_VERB, self._taskId, score);
            self.sendLoggingMessage(msg);
        };
        
        /** Send if all steps completed message (or % complete,   if unfinished) **/
        self.sendCompletedAllSteps = function sendCompletedAllSteps(percentComplete){
            if (percentComplete == null){percentComplete = 1.0;}
            percentComplete = self.clampToUnitValue(percentComplete);
            var msg = Message(self._userId, COMPLETED_ALL_STEPS_VERB, self._taskId, percentComplete*1.0);
            self.sendLoggingMessage(msg);
        };
        
        /** Send a message that a step was completed (or marked incomplete, alternatively) **/
        self.sendCompletedStep = function sendCompletedStep(stepId, isComplete){
            if (isComplete == null){isComplete = 1.0;}
            isComplete = self.clampToUnitValue(isComplete);
            var msg = Message(self._userId, COMPLETED_STEP_VERB, stepId, 1.0*isComplete);
            self.sendLoggingMessage(msg);
        };
        
        /** Send a KC Score about performance on a specific skill during the activity **/
        self.sendKCScore = function sendKCScore(kcName, score, relevance){
            if (relevance == null){relevance = 1.0;}
            relevance = self.clampToUnitValue(relevance);
            score = self.clampToUnitValue(score);
            var msg = Message(self._userId, KC_SCORE_VERB, kcName, score);
            msg.setContextValue(KC_RELEVANCE_KEY, relevance);
            self.sendLoggingMessage(msg);
        };
        
        self.sendMastery = function sendMastery(kcName, score, stepId){
            score = self.clampToUnitValue(score);
            var msg = Message(self._userId, MASTERY_VERB, kcName, score);
            msg.setContextValue(STEP_ID_KEY, stepId);
            self.sendLoggingMessage(msg);
        }; 
        
         /** Notify that some other help was presented **/
        self.sendHelp = function sendHelp(content, stepId, helpType, contentType){
            self._sendHelpMessage(TASK_HELP_VERB, content, stepId, helpType, contentType);
        };
        
        /** Notify that a hint was presented **/
        self.sendHint = function sendHint(content, stepId, helpType, contentType){
            self._sendHelpMessage(TASK_HINT_VERB, content, stepId, helpType, contentType);
        };
 
        /** Notify that feedback was presented **/
        self.sendFeedback = function sendFeedback(content, stepId, helpType, contentType){
            self._sendHelpMessage(TASK_FEEDBACK_VERB, content, stepId, helpType, contentType);
        };
        
        /** Notify that positive feedback was presented **/
        self.sendPositiveFeedback = function sendPositiveFeedback(content, stepId, contentType){
            self._sendHelpMessage(TASK_FEEDBACK_VERB, content, stepId, POSITIVE_HELP_TYPE, contentType);
        }; 
        
        /** Notify that neutral feedback was presented **/
        self.sendNeutralFeedback = function sendNeutralFeedback(content, stepId, contentType){
            self._sendHelpMessage(TASK_FEEDBACK_VERB, content, stepId, NEUTRAL_HELP_TYPE, contentType);
        }; 
        
        /** Notify that negative feedback was presented **/
        self.sendNegativeFeedback = function sendNegativeFeedback(content, stepId, contentType){
            self._sendHelpMessage(TASK_FEEDBACK_VERB, content, stepId, NEGATIVE_HELP_TYPE, contentType);
        }; 
        
        /** Notify that task was decomposed **/
        self.sendTaskDecomposed = function sendTaskDecomposed(content, stepId, helpType, contentType){
            self._sendHelpMessage(TASK_DECOMPOSITION_VERB, content, stepId, helpType, contentType);
        }; 

        /** Notify that task presented some content **/
        self.sendPresented = function sendPresented(elementId, content, stepId, contentType){
            if ((contentType == null) && content != null){
                contentType = 'text';
                content = content.toString();
            }
            var msg = Message(self._activityType, PRESENTED_VERB, elementId, content);
            msg.setContextValue(STEP_ID_KEY, stepId);
            msg.setContextValue(RESULT_CONTENT_TYPE_KEY, contentType);
            self.sendLoggingMessage(msg);
        };

        /** Notify that user selected some element (e.g., in terms of HTML: making active) **/
        self.sendSelectedOption = function sendSelectedOption(elementId, content, stepId, contentType){
            self._sendInputMessage(SELECTED_OPTION_VERB, elementId, content, stepId, contentType);
        };

        /** Notify that user selected some element (e.g., in terms of HTML: making active) **/
        self.sendSubmittedAnswer = function sendSubmittedAnswer(elementId, content, stepId, contentType){
            self._sendInputMessage(SUBMITTED_ANSWER_VERB, elementId, content, stepId, contentType);
        };
        
        /** Notify that user demonstrated a misconception.
            This requires the misconception ID, rather than the element.
        **/
        self.sendMisconception = function sendMisconception(misconceptionId, content, stepId, contentType){
            self._sendInputMessage(MISCONCEPTION_VERB, misconceptionId, content, stepId, contentType);
        };

        /** Send the overall level of system support given to the user for this task **/
        self.sendTaskSupport = function sendTaskSupport(supportLevel){
            supportLevel = self.clampToUnitValue(supportLevel);
            var msg = Message(self._userId, TASK_SUPPORT_VERB, self._taskId, supportLevel);
            self.sendLoggingMessage(msg);
        };  

        /** Send the overall number of hints given. To be used when individual hints cannot be logged, but the aggregate can be. **/
        self.sendTaskHelpCount = function sendTaskHelpCount(numHelpActs){
            if (numHelpActs < 0){numHelpActs = 0;}
            var msg = Message(self._userId, TASK_HELP_COUNT_VERB, self._taskId, numHelpActs);
            self.sendLoggingMessage(msg);
        };

        /** Send the words per second when user was expected to enter content **/
        self.sendWordsPerSecond = function sendWordsPerSecond(value, evidence, stepId){
            if (value < 0){value = 0;}
            self._sendMetricMessage(WORDS_PER_SECOND_VERB, value, evidence, stepId, false);
        };
        
        /** Send the words per second when user was expected to enter content **/
        self.sendActionsPerSecond = function sendActionsPerSecond(value, evidence, stepId){
            if (value < 0){value = 0;}
            self._sendMetricMessage(ACTIONS_PER_SECOND_VERB, value, evidence, stepId, false);
        };
        
        /** Send the semantic match for content submitted **/
        self.sendAnswerSemanticMatch = function sendAnswerSemanticMatch(value, evidence, stepId){
            self._sendMetricMessage(ANSWER_SEMANTIC_MATCH_VERB, value, evidence, stepId, true);
        };

        self.sendPersistence = function sendPersistence(value, evidence, stepId){
            self._sendMetricMessage(PERSISTENCE_VERB, value, evidence, stepId, true);
        };
        
        self.sendImpetuousness = function sendImpetuousness(value, evidence, stepId){
            self._sendMetricMessage(IMPETUOUSNESS_VERB, value, evidence, stepId, true);
        };

       self.sendGamingTheSystem = function sendGamingTheSystem(value, evidence, stepId){
            self._sendMetricMessage(GAMING_SYSTEM_VERB, value, evidence, stepId, true);
        };        

        self.sendConfusion = function sendConfusion(value, evidence, stepId){
            self._sendMetricMessage(CONFUSION_VERB, value, evidence, stepId, true);
        }; 
    
        self.sendDisengagement = function sendDisengagement(value, evidence, stepId){
            self._sendMetricMessage(DISENGAGEMENT_VERB, value, evidence, stepId, true);
        }; 

        self.sendWheelspinning = function sendWheelspinning(value, evidence, stepId){
            self._sendMetricMessage(WHEELSPINNING_VERB, value, evidence, stepId, true);
        };         
    
        /** Internal Function to notify server that some help message was presented **/
        self._sendHelpMessage = function _sendHelpMessage(verb, content, stepId, helpType, contentType){
            if ((contentType == null) && content != null){
                contentType = 'text';
                content = content.toString();
            }
            if (helpType == null){ helpType = NEUTRAL_HELP_TYPE;}
            var msg = Message(self._activityType, verb, stepId, content);
            msg.setContextValue(STEP_ID_KEY, stepId);
            msg.setContextValue(HELP_TYPE_KEY, helpType);
            msg.setContextValue(RESULT_CONTENT_TYPE_KEY, contentType);
            self.sendLoggingMessage(msg);
        };
        
        /** Internal Function to notify server that user submitted input **/
        self._sendInputMessage = function _sendInputMessage(verb, elementId, content, stepId, contentType){
            if ((contentType == null) && content != null){
                contentType = 'text';
                content = content.toString();
            }
            var msg = Message(self._userId, verb, elementId, content);
            msg.setContextValue(STEP_ID_KEY, stepId);
            msg.setContextValue(RESULT_CONTENT_TYPE_KEY, contentType);
            self.sendLoggingMessage(msg);
        };
        
        /** Internal function for sending metric values **/
        self._sendMetricMessage = function _sendMetricMessage(verb, value, evidence,  stepId, clampToUnit){
            if (evidence == null){evidence = [];}
            if (clampToUnit){value = self.clampToUnitValue(value);}
            var msg = Message(self._userId, verb, evidence, value);
            msg.setContextValue(STEP_ID_KEY, stepId);
            self.sendLoggingMessage(msg);
        };
        
        self.clampToUnitValue = function clampToUnitValue(val){
            if (val != null){
                return Math.min(Math.max(val, 0.0), 1.0);
            }
            return val;
        };
    }
});

// Core Verbs (for events that occurred)
namespace.LOADED_VERB = LOADED_VERB;

namespace.COMPLETED_VERB = COMPLETED_VERB;
namespace.COMPLETED_ALL_STEPS_VERB = COMPLETED_ALL_STEPS_VERB;
namespace.COMPLETED_STEP_VERB = COMPLETED_STEP_VERB;
namespace.KC_SCORE_VERB = KC_SCORE_VERB;

namespace.TASK_HELP_VERB = TASK_HELP_VERB;
namespace.TASK_HINT_VERB = TASK_HINT_VERB;
namespace.TASK_FEEDBACK_VERB = TASK_FEEDBACK_VERB;
namespace.TASK_DECOMPOSITION_VERB = TASK_DECOMPOSITION_VERB;
namespace.TASK_SUPPORT_VERB = TASK_SUPPORT_VERB;
namespace.TASK_HELP_COUNT_VERB = TASK_HELP_COUNT_VERB;
namespace.PRESENTED_VERB = PRESENTED_VERB;

namespace.SELECTED_OPTION_VERB = SELECTED_OPTION_VERB;
namespace.SUBMITTED_ANSWER_VERB = SUBMITTED_ANSWER_VERB;
namespace.MISCONCEPTION_VERB = MISCONCEPTION_VERB;

// Verbs for Metrics
namespace.WORDS_PER_SECOND_VERB = WORDS_PER_SECOND_VERB;
namespace.ACTIONS_PER_SECOND_VERB = ACTIONS_PER_SECOND_VERB;
namespace.PERSISTENCE_VERB = PERSISTENCE_VERB;
namespace.IMPETUOUSNESS_VERB = IMPETUOUSNESS_VERB;
namespace.GAMING_SYSTEM_VERB = GAMING_SYSTEM_VERB;
namespace.WHEELSPINNING_VERB = WHEELSPINNING_VERB;
namespace.CONFUSION_VERB = CONFUSION_VERB;
namespace.DISENGAGEMENT_VERB = DISENGAGEMENT_VERB;
namespace.MASTERY_VERB = MASTERY_VERB;

// Context Keys
namespace.DURATION_KEY = DURATION_KEY;
namespace.TASK_ID_KEY = TASK_ID_KEY;
namespace.ACTIVITY_TYPE_KEY = ACTIVITY_TYPE_KEY;
namespace.KC_RELEVANCE_KEY = KC_RELEVANCE_KEY;
namespace.RESULT_CONTENT_TYPE_KEY = RESULT_CONTENT_TYPE_KEY;
namespace.HELP_TYPE_KEY = HELP_TYPE_KEY;

namespace.POSITIVE_HELP_TYPE = POSITIVE_HELP_TYPE;
namespace.NEUTRAL_HELP_TYPE = NEUTRAL_HELP_TYPE;
namespace.NEGATIVE_HELP_TYPE = NEGATIVE_HELP_TYPE;

// Classes
namespace.StandardITSLoggingService = StandardITSLoggingService;

SuperGLU.Standard_ITS_Logging = namespace;
})(window.Standard_ITS_Logging = window.Standard_ITS_Logging || {});