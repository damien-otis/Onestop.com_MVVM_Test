
var Model = function(config){

	var Model = function(){};

	Model.prototype = {

		model	: {},

		//---------------------------------------------------------
		/*
		* @function		addShipment
		* @memberOf		Model
		* @desc			Adds a new shipment to the model.
		* @param		{string} ship_name
		*/

		addShipment:	function(ship_name){
			var new_ship = self.newShipment(ship_name);
			self.model[new_ship.ship_id] = new_ship;
			return new_ship;
		},

		//---------------------------------------------------------
		/*
		* @function		newShipment
		* @memberOf		Model
		* @desc			create a new shipment object.
		* @param		{string} name
		* @returns		{object} shipment
		*/

		newShipment:	function(name){
			return {
				ship_id			: self.newGuid(),
				name			: name || "",
				total_weight	: 0,
				unit			: "lbs",
				items			: {}
			};
		},

		//---------------------------------------------------------
		/*
		* @function		removeShipment
		* @memberOf		Model
		* @desc			Removes a shipemnt from the model.
		* @param		{string} ship_id
		*/
		removeShipment:	function(ship_id){
			delete self.model[ship_id];
		},

		//---------------------------------------------------------
		/*
		* @function		setShipmentName
		* @memberOf		Model
		* @desc			Sets the name of a shipment in the model.
		* @param		{string} ship_id, {string} name
		*/
		setShipmentName: function(ship_id,name){
			self.model[ship_id].name = name;
		},

		//---------------------------------------------------------
		/*
		* @function		getShipmentName
		* @memberOf		Model
		* @desc			Gets the name of a shipment in the model.
		* @param		{string} ship_id
		* @returns		{string} name
		*/
		getShipmentName:	function(ship_id){
			return self.model[ship_id].name;
		},

		//---------------------------------------------------------
		/*
		* @function		getShipmentTotalWeight
		* @memberOf		Model
		* @desc			Gets the total weight of a shipment in the model.
		* @param		{string} ship_id
		* @returns		{float} total_weight
		*/
		getShipmentTotalWeight:	function(ship_id){
			return self.model[ship_id].total_weight;
		},

		//---------------------------------------------------------
		/*
		* @function		getShipmentTotalWeight
		* @memberOf		Model
		* @desc			Updates the total shipment weight by calculating weight of each item in the shipment.
		* @param		{string} ship_id
		* @returns		{float} total_weight
		*/
		updateShipmentWeight:	function(ship_id){
			var total_weight = 0;
			var items = self.model[ship_id].items;
			for (var key in items) {
				total_weight += parseFloat(items[key].weight)||0;
			}
			self.model[ship_id].total_weight = total_weight;
			return total_weight;
		},

		//---------------------------------------------------------
		/*
		* @function		addItem
		* @memberOf		Model
		* @desc			Adds a new item to a shipment in the model.
		* @param		{string} ship_id
		* @returns		{object} item
		*/
		addItem:	function(ship_id){
			var new_item = self.newItem();
			new_item.ship_id = ship_id;
			self.model[ship_id].items[new_item.item_id] = new_item;
			return new_item;
		},

		//---------------------------------------------------------
		/*
		* @function		newItem
		* @memberOf		Model
		* @desc			Creates a new item object.
		* @returns		{object} item
		*/
		newItem:	function(){
			return {
				item_id	: self.newGuid(),
				name	: "",
				weight	: 0,
				unit	: "lbs"
			};
		},

		//---------------------------------------------------------
		/*
		* @function		setItemWeight
		* @memberOf		Model
		* @desc			Sets the weight of an item in a shipment in the model. Updates the total shipping weight.
		* @param		{string} ship_id, {string} item_id, {string} weight
		*/
		setItemWeight:	function(ship_id,item_id,weight){
			self.model[ship_id].items[item_id].weight = weight;
			self.updateShipmentWeight(ship_id);
		},

		//---------------------------------------------------------
		/*
		* @function		removeItem
		* @memberOf		Model
		* @desc			Removes an item from a shipment in the model. Updates the total shipping weight.
		* @param		{string} ship_id, {string} item_id
		*/
		removeItem:	function(ship_id,item_id){
			delete self.model[ship_id].items[item_id];
			self.updateShipmentWeight(ship_id);
		},

		//---------------------------------------------------------
		/*
		* @function		setItemName
		* @memberOf		Model
		* @desc			Sets an item name in a shipment in the model.
		* @param		{string} ship_id, {string} item_id
		*/
		setItemName:	function(ship_id,item_id,name){
			self.model[ship_id].items[item_id].name = name;
		},

		//---------------------------------------------------------
		/*
		* @function		getItemName
		* @memberOf		Model
		* @desc			Gets an item name in a shipment in the model.
		* @param		{string} ship_id, {string} item_id
		* @return		{string} name
		*/
		getItemName:	function(ship_id,item_id){
			return self.model[ship_id].items[item_id].name;
		},

		//---------------------------------------------------------
		/*
		* @function		getItemWeight
		* @memberOf		Model
		* @desc			Gets an item name in a shipment in the model.
		* @param		{string} ship_id, {string} item_id
		* @return		{float} weight
		*/
		getItemWeight:	function(ship_id,item_id){
			return self.model[ship_id].items[item_id].weight;
		},

		//---------------------------------------------------------
		/*
		* @function		newGuid
		* @memberOf		Model
		* @desc			Gets a new guid unique id (from random numbers).
		* @return		{string} guid
		*/
		newGuid:	function(){
			function s4() {
				return Math.floor((Math.random()+1) * 65536).toString(16).substring(1);
			};
			return s4()+s4()+'-'+s4()+'-'+s4()+'-'+s4()+'-'+s4()+s4()+s4();
		},

		//---------------------------------------------------------
		/*
		* @function		exportModel
		* @memberOf		Model
		* @desc			Gets a new guid unique id (from random numbers).
		* @returns		{string} JSON data from model
		*/
		exportModel:	function(){
			var shipments = [];

			for (var ship_id in self.model) {
				var shipment = {
					name			: self.model[ship_id].name,
					total_weight	: self.model[ship_id].total_weight,
					items			: []
				};
				for (var item_id in self.model[ship_id].items) {
					var this_item = self.model[ship_id].items[item_id];
					var item = {
						name	: this_item.name,
						weight	: this_item.weight
					};
					shipment.items.push(item);
				};

				shipments.push(shipment);
			};

			var export_json = JSON.stringify(shipments,null,"\t").replace(/\n/g,"<br>").replace(/\t/g,"&nbsp;&nbsp;&nbsp;&nbsp;");

			return export_json;

		}

	};

	Model.prototype.config = config || {};

	var self = new Model();

	return self;

}