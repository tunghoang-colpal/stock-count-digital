const stockCountSpreadSheet = SpreadsheetApp.openById('13uEjjQdzksZvg8uMYZE4S8gyX5usI2iK6D_SfQrxWUE');
const mixingDataSheet = stockCountSpreadSheet.getSheetByName('Stock Count Material_Mixing');
const himMachineSheet = stockCountSpreadSheet.getSheetByName('HIM');
const imInformationSheet = stockCountSpreadSheet.getSheetByName('IM information');
const imMachineSheet = stockCountSpreadSheet.getSheetByName('IM machine');
const teDataSheet = stockCountSpreadSheet.getSheetByName('TE');
const pkgDataSheet = stockCountSpreadSheet.getSheetByName('PKG');
const stockCountSubmitDatabase = SpreadsheetApp.openById('1uhYYVQBR45tpX9hUXV7YEgGYBDSRZhAWj9PHkNV5rvQ');
const resinSubmitData = stockCountSubmitDatabase.getSheetByName('Mixing');
const colorantSubmitData = stockCountSubmitDatabase.getSheetByName('Colorant');
const vimSubmitData = stockCountSubmitDatabase.getSheetByName('VIM');
const himSubmitData = stockCountSubmitDatabase.getSheetByName('HIM');
/**
 * Returns information about the which material code belong to which material type.
 * @param {String} materialType The type of material which is currently be using.
 * @return {<Object>} The material code as an object.
 */

function getMixingData(
	materialType,
	materialResinCode = [],
	materialResinDescription = [],
	materialColorantCode = [],
	materialColorantDescription = []
) {
	let dataRange = mixingDataSheet.getDataRange();
	for (let i = 0; i < dataRange.getLastRow(); i++) {
		if (
			mixingDataSheet.getRange(i + 1, 1).getValue() === materialType &&
			mixingDataSheet.getRange(i + 1, 4).getValue() === 'Active'
		) {
			materialResinCode.push(mixingDataSheet.getRange(i + 1, 2).getValue());
			materialResinDescription.push(mixingDataSheet.getRange(i + 1, 3).getValue());
		}
	}
	let mixingData = new MixingMaterial(materialType, materialResinCode, materialResinDescription);
	return mixingData;
}

/**
 * Returns production information at injection molding area.
 * @param {String} areaCluster The cluster of area in Shopfloor
 * @return {<Object>} The injection molding information as an object.
 */

function getIMData(areaCluster, subAreaCluster, clusterColumn = {}) {
	console.log(areaCluster);
	let dataRange = imMachineSheet.getDataRange().getValues();
	let cluster = {};
	switch (areaCluster) {
		case 'Cụm 1 - 6':
			clusterColumn = {
				'Cụm 1': 'A3:A27',
				'Cụm 2': 'B3:B38',
				'Cụm 3': 'C3:C38',
				'Cụm 4': 'D3:D11'
			};
			if (clusterColumn.hasOwnProperty(subAreaCluster)) {
				cluster = imMachineSheet
					.getRange(clusterColumn[subAreaCluster])
					.getValues()
					.map((value) => value[0]);
			}
			break;
		case 'Cụm 7 - 12':
			clusterColumn = {
				'Cụm 1': 'E3:E23',
				'Cụm 2': 'F3:F30',
				'Cụm 3': 'G3:G30',
				'Cụm 4': 'H3:H6'
			};
			if (clusterColumn.hasOwnProperty(subAreaCluster)) {
				cluster = imMachineSheet
					.getRange(clusterColumn[subAreaCluster])
					.getValues()
					.map((value) => value[0]);
			}
			break;
		case 'Cụm 13 - 21':
			clusterColumn = {
				'Cụm 1': 'I3:I29',
				'Cụm 2': 'J3:J34'
			};

			if (clusterColumn.hasOwnProperty(subAreaCluster)) {
				cluster = imMachineSheet
					.getRange(clusterColumn[subAreaCluster])
					.getValues()
					.map((value) => value[0]);
			}
			break;
	}
	let bundle = imInformationSheet
		.getRange('A2:A' + imInformationSheet.getLastRow())
		.getValues()
		.map((value) => value[0])
		.filter((value) => value != '');
	let color = imInformationSheet
		.getRange('B2:B' + imInformationSheet.getLastRow())
		.getValues()
		.map((value) => value[0])
		.filter((value) => value != '');
	let tankType = imInformationSheet
		.getRange('C2:C' + imInformationSheet.getLastRow())
		.getValues()
		.map((value) => value[0])
		.filter((value) => value != '');
	let wipType = imInformationSheet
		.getRange('D2:D' + imInformationSheet.getLastRow())
		.getValues()
		.map((value) => value[0])
		.filter((value) => value != '');
	let imData = new ImData(cluster, bundle, color, tankType, wipType);
	return imData;
}

/**
 * paste users input data into destination sheet
 * @param {String} area in which data is belong to
 * @param {<Object>} users input in web apps which is exposed as a Javascript object
 */
function submitResinStockCount(responseData) {
	let lastRowIndex = resinSubmitData.getDataRange().getLastRow();
	let todayDate = Utilities.formatDate(new Date(), 'GMT+7', 'dd/MM/yyyy');
	for (let i = 0; i < responseData['materialcode'].length; i++) {
		resinSubmitData.getRange(lastRowIndex + i + 1, 1).setValue(lastRowIndex + i);
		resinSubmitData.getRange(lastRowIndex + i + 1, 2).setValue(responseData['materialtype']);
		resinSubmitData.getRange(lastRowIndex + i + 1, 3).setValue(responseData['materialcode'][i]);
		resinSubmitData.getRange(lastRowIndex + i + 1, 4).setValue(responseData['machine-fullpack'][i]);
		resinSubmitData.getRange(lastRowIndex + i + 1, 5).setValue(responseData['buffer-fullpack'][i]);
		resinSubmitData.getRange(lastRowIndex + i + 1, 6).setValue(responseData['machine-leftover'][i]);
		resinSubmitData.getRange(lastRowIndex + i + 1, 7).setValue(responseData['buffer-leftover'][i]);
		resinSubmitData.getRange(lastRowIndex + i + 1, 8).setValue(todayDate);
		resinSubmitData.getRange(lastRowIndex + i + 1, 9).setValue(responseData['username']);
	}
	return true;
}

function submitColorantStockCount(responseData) {
	let lastRowIndex = colorantSubmitData.getDataRange().getLastRow();
	let todayDate = Utilities.formatDate(new Date(), 'GMT+7', 'dd/MM/yyyy');
	for (let i = 0; i < responseData['materialcode'].length; i++) {
		colorantSubmitData.getRange(lastRowIndex + i + 1, 1).setValue(lastRowIndex + i);
		colorantSubmitData.getRange(lastRowIndex + i + 1, 2).setValue(responseData['materialtype']);
		colorantSubmitData.getRange(lastRowIndex + i + 1, 3).setValue(responseData['materialcode'][i]);
		colorantSubmitData.getRange(lastRowIndex + i + 1, 4).setValue(responseData['colorantweight'][i]);
		colorantSubmitData.getRange(lastRowIndex + i + 1, 5).setValue(todayDate);
		colorantSubmitData.getRange(lastRowIndex + i + 1, 6).setValue(responseData['username']);
	}
	return true;
}

/**
 *
 * @param {object} responseData
 */
function submitIMStockCount(responseData) {
	let vimSheet = vimSubmitData;
	let himSheet = himSubmitData;
	let todayDate = Utilities.formatDate(new Date(), 'GMT+7', 'dd/MM/yyyy');

	for (let i = 0; i < responseData['machinename'].length; i++) {
		console.log(responseData['machinename'][i].split('')[0]);
		let machineTypeSheet = responseData['machinename'][i].split('')[0] === 'V' ? vimSheet : himSheet;
		let lastRowIndex = machineTypeSheet.getDataRange().getLastRow();
		machineTypeSheet.getRange(lastRowIndex + 1, 1).setValue(lastRowIndex - 1 + 1);
		machineTypeSheet.getRange(lastRowIndex + 1, 2).setValue(responseData['machinename'][i]);
		machineTypeSheet.getRange(lastRowIndex + 1, 3).setValue(responseData['bundle'][i]);
		machineTypeSheet.getRange(lastRowIndex + 1, 4).setValue(responseData['color'][i]);
		machineTypeSheet.getRange(lastRowIndex + 1, 5).setValue(responseData['tanktype'][i]);
		machineTypeSheet.getRange(lastRowIndex + 1, 6).setValue(responseData['tankweight'][i]);
		machineTypeSheet.getRange(lastRowIndex + 1, 7).setValue(responseData['hoper'][i]);
		machineTypeSheet.getRange(lastRowIndex + 1, 3).setValue(responseData['bundle'][i]);
		machineTypeSheet.getRange(lastRowIndex + 1, 4).setValue(responseData['color'][i]);
		machineTypeSheet.getRange(lastRowIndex + 1, 5).setValue(responseData['tanktype'][i]);
		machineTypeSheet.getRange(lastRowIndex + 1, 6).setValue(responseData['tankweight'][i]);
	}

	console.log(responseData);
	return true;
}

/**
 * Special function that handles HTTP GET requests to the published web app.
 * @return {HtmlOutput} The HTML page to be served.
 */
function doGet() {
	return HtmlService.createTemplateFromFile('index')
		.evaluate()
		.setTitle('Stock Count')
		.addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/**
 *
 * @param {html} filename include javascript and style file of which .html
 */
function include(filename) {
	return HtmlService.createHtmlOutputFromFile(filename).getContent();
}
