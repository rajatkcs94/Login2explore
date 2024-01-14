/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var jpdbBaseURL = 'http://api.login2explore.com:5577';
var jpdbIRL = '/api/irl';
var jpbdIML = '/api/iml';
var collegeDatabaseName = 'COLLEGE-DB';
var projectRelationName = 'PROJECT-TABLE';
var connectionToken = '90931823|-31949306941517642|90960678';

$('#projectId').focus();



//Function for return alter HTML code according to status of response
function alertHandlerHTML(status, message) {
    // 1--> Success , 0--> Warning
    
    if (status === 1) {
        return `<div class="alert  alert-primary d-flex align-items-center alert-dismissible " role="alert">
                <svg class="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="Info:"><use xlink:href="#info-fill"/></svg>
                <div>
                  <strong>Success!</strong> ${message}
                </div>
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
              </div>`;
    } else {
        return `<div class="alert  alert-warning d-flex align-items-center alert-dismissible" role="alert">
        <svg class="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="Warning:"><use xlink:href="#exclamation-triangle-fill"/></svg>
        <div>
          <strong>Warning!</strong> ${message}
        </div>
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      </div>`;
    }

}

////Function for append alter message into alter div
function alertHandler(status, message) {
    var alterHTML = alertHandlerHTML(status, message);
    let alertDiv = document.createElement('div');
    alertDiv.innerHTML = alterHTML;
    $('#disposalAlertContainer').append(alertDiv);
}

// Function for save record number into localstorage
function saveRecNoToLocalStorage(jsonObject) {
    var lvData = JSON.parse(jsonObject.data);
    localStorage.setItem('recordNo', lvData.rec_no);
}

// Function for disable all element on page except project number input feild
function disableAllFeildExceptProjectId() {
    $('#projectName').prop('disabled', true);
    $('#assignTo').prop('disabled', true);
    $('#assignmentDate').prop('disabled', true);
    $('#deadlineDate').prop('disabled', true);
    $('#resetBtn').prop('disabled', true);
    $('#saveBtn').prop('disabled', true);
    $('#updateBtn').prop('disabled', true);
}


//Function for reset form data and disable all other feild except project number
function resetForm() {
    $('#projectName').val("");
    $('#assignTo').val("");
    $('#assignmentDate').val("");
    $('#deadlineDate').val("");

    $('#projectId').prop('disabled', false);
    disableAllFeildExceptProjectId();
    $('#projectId').focus();


}

//Function for fill data if project already is present in database
function fillData(jsonObject) {
    if (jsonObject === "") {
        $('#projectName').val("");
        $('#assignTo').val("");
        $('#assignmentDate').val("");
        $('#deadlineDate').val("");
    } else {
        // project record number saved to localstorage
        saveRecNoToLocalStorage(jsonObject);
        
        // parse json object into JSON
        var data = JSON.parse(jsonObject.data).record;
        
        $('#projectName').val(data.name);
        $('#assignTo').val(data.assignToName);
        $('#assignmentDate').val(data.assignmentDate);
        $('#deadlineDate').val(data.deadlineDate);
    }
}


//Function to check validity of Number
function validateAssignmentDate() {
    var inputAssignmentDate = $('#assignmentDate').val();
    var inputDeadlineDate = $('#deadlineDate').val();
    inputAssignmentDate = new Date(inputAssignmentDate);
    inputDeadlineDate = new Date(inputDeadlineDate);
    
    //deadline date should be greater than assignment date
    return inputAssignmentDate.getTime() < inputDeadlineDate.getTime();

}

//Function to check validity of user input data
function validateFormData() {
    var projectId, projectName, assignTo, assignmentDate, deadlineDate;
    projectId = $('#projectId').val();
    projectName = $('#projectName').val();
    assignTo = $('#assignTo').val();
    assignmentDate = $('#assignmentDate').val();
    deadlineDate = $('#deadlineDate').val();


    if (projectId === '') {
        alertHandler(0, 'Project NO Missing');
        $('#projectId').focus();
        return "";
    }

    if (projectId <= 0) {
        alertHandler(0, 'Invalid Project-No');
        $('#projectId').focus();
        return "";
    }

    if (projectName === '') {
        alertHandler(0, 'Project Name is Missing');
        $('#projectName').focus();
        return "";
    }
    if (projectName <= 0 && projectName > 50) {
        alertHandler(0, 'Invalid Project Name');
        $('#projectName').focus();
        return "";
    }
    if (assignTo === '') {
        alertHandler(0, 'Assign To Is Missing');
        $('#assignTo').focus();
        return "";
    }
    if (assignmentDate === '') {
        alertHandler(0, 'Assignment Date Is Missing');
        $('#assignmentDate').focus();
        return "";
    }
    if (deadlineDate === '') {
        alertHandler(0, 'Deadline Data Is Missing');
        $('#deadlineDate').focus();
        return "";
    }

    if (!validateAssignmentDate()) {
        alertHandler(0, 'Invalid Date(i.e Assignment Date should be greater than Deadline Date)');
        $('#deadlineDate').focus();
        return "";
    }

    // if data is valid then create a JSON object otherwise return empty string( which denote that data is not valid )
    var jsonStrObj = {
        id: projectId,
        name: projectName,
        assignTo: assignTo,
        assignmentDate: assignmentDate,
        deadlineDate: deadlineDate
    };
    
    //Convert JSON object into string 
    return JSON.stringify(jsonStrObj);
}


//Function to return stringified JSON object whcih contain project number of project
function getProjectnoAsJsonObj() {
    var projectId = $('#projectId').val();
    var jsonStr = {
        id: projectId
    };
    return JSON.stringify(jsonStr);
}


// Function to query details of existing project
function getProjectData() {

     
    if ($('#projectId').val() === "") { // if project number is not given then disable all feild
        disableAllFeildExceptProjectId();
    } else if ($('#projectId').val() < 1) { // if project number is not valid (i.e project-no <1)
        disableAllFeildExceptRollno();
        alertHandler(0, 'Invalid Project-Id');
        $('#projectId').focus();
    } else { // if project number is valid
        var projectNoJsonObj = getProjectnoAsJsonObj(); 
        
        // create GET Request object
        var getRequest = createGET_BY_KEYRequest(connectionToken, collegeDatabaseName, projectRelationName, projectNoJsonObj);
        
        jQuery.ajaxSetup({async: false});
        // make GET request
        var resJsonObj = executeCommandAtGivenBaseUrl(getRequest, jpdbBaseURL, jpdbIRL);
        jQuery.ajaxSetup({async: true});
        
        // Enable all feild
        $('#projectId').prop('disabled', false);
        $('#projectName').prop('disabled', false);
        $('#assignTo').prop('disabled', false);
        $('#assignmentDate').prop('disabled', false);
        $('#deadlineDate').prop('disabled', false);

        
        if (resJsonObj.status === 400) { // if project not exist already with same project number then enable save and reset btn
            $('#resetBtn').prop('disabled', false);
            $('#saveBtn').prop('disabled', false);
            $('#updateBtn').prop('disabled', true);
            fillData("");
            $('#name').focus();
        } else if (resJsonObj.status === 200) {// if project exist already with same project number then enable update and reset btn
            $('#projectId').prop('disabled', true);
            fillData(resJsonObj);
            $('#resetBtn').prop('disabled', false);
            $('#updateBtn').prop('disabled', false);
            $('#saveBtn').prop('disabled', true);
            $('#name').focus();
        }
    }



}

//Function to make PUT request to save data into database
function saveData() {
    var jsonStrObj = validateFormData();
    
    // If form data is not valid
    if (jsonStrObj === '')
        return '';

    // create PUT Request object
    var putRequest = createPUTRequest(connectionToken, jsonStrObj, collegeDatabaseName, projectRelationName);
    jQuery.ajaxSetup({async: false});
    
    //Make PUT Request for saving data into database
    var resJsonObj = executeCommandAtGivenBaseUrl(putRequest, jpdbBaseURL, jpbdIML);
    jQuery.ajaxSetup({async: true});
    
    if (resJsonObj.status === 400) {// If data is not saved
        alertHandler(0, 'Data Is Not Saved ( Message: ' + resJsonObj.message + " )");
    } else if (resJsonObj.status === 200) {// If data is successfully saved
        alertHandler(1, 'Data Saved successfully');
    }
    //After saving to databse resent from data 
    resetForm();
    
    $('#projectId').focus();
}



//Function used to make UPDATE Request
function changeData() {
    $('#changeBtn').prop('disabled', true);
    var jsonChg = validateFormData(); // Before making UPDATE Request validate form data
    
    // Create UPDATE Request object
    var updateRequest = createUPDATERecordRequest(connectionToken, jsonChg, collegeDatabaseName, projectRelationName, localStorage.getItem("recordNo"));
    jQuery.ajaxSetup({async: false});
    
    //Make UPDATE Request
    var resJsonObj = executeCommandAtGivenBaseUrl(updateRequest, jpdbBaseURL, jpbdIML);
    jQuery.ajaxSetup({async: true});
    
    if (resJsonObj.status === 400) {// If data is not saved
        alertHandler(0, 'Data Is Not Update ( Message: ' + resJsonObj.message + " )");
    } else if (resJsonObj.status === 200) {// If data is successfully saved
        alertHandler(1, 'Data Update successfully');
    }
    
    //After updating to databse resent from data
    resetForm();
    $('#empid').focus();
}


