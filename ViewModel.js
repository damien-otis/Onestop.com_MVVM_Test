
var ViewModel = function(config){

	var ViewModel = function(){};

	ViewModel.prototype = {
		/*
		* @config		config
		* @memberOf		ViewModel
		* @desc
		*		config.className	: sets a skinning CSS className.
		*/
		config:	config,

		viewmodel:{},

		//------------------------------------------------------------
		/*
		* @function		init
		* @memberOf		ViewModel
		* @desc			create the first DOM elements of the UI
		*/
		init:	function(){

			self.$Shipments = $('<div class="Shipments"></div>').addClass(self.config.className).appendTo(config.view);
			self.$CreateShipmentName = $('<input class="CreateShipmentName" placeholder="Shipment Name" type="text"/>').appendTo(self.$Shipments);
			self.$CreateShipment = $('<input class="CreateShipment" value="Create Shipment" type="button"/>').appendTo(self.$Shipments);
			self.$Shipments.bind("click keydown keyup keypress change focus blur",self.eventDelegate);
			self.$CreateShipmentName.focus();

		},

		//------------------------------------------------------------
		/*
		* @function		eventDelegate
		* @memberOf		ViewModel
		* @desc			Routes events to handlers based on first css class name of the element.
		* @param		{event object} evt
		*/
		eventDelegate:function(evt){
			var $elem = $(evt.target);
			var binding = (evt.target.className||"").split(" ")[0];
			if (!binding || !self.bindings[binding]){return};
			var thishandler = self.bindings[binding][evt.type];
			if (thishandler){thishandler($elem,evt)};
		},

		//------------------------------------------------------------
		/*
		* @object		bindings
		* @memberOf		ViewModel
		* @desc			Container for event delegation bindings.
		*/
		bindings:{

			CreateShipmentName: {
				/*-----------------------------------------------------------
				* @function		keydown
				* @memberOf		ViewModel.bindings.CreateShipmentName
				* @desc			If input is [CR] then create a new shipment if the name is not empty.
				*/
				keydown:	function($elem,evt){
					if (evt.keyCode == 13 && $elem.val()!="") {
						self.bindings.CreateShipment.click($elem,evt);
						evt.preventDefault();
						evt.stopPropagation();
						return false;
					}
				}
			},

			CreateShipment:	{
				/*-----------------------------------------------------------
				* @function		click
				* @memberOf		ViewModel.bindings.CreateShipment
				* @desc			Creates a new shipment.
				*/
				click:function($elem,evt){

					var ship_name = self.$CreateShipmentName.val();

					if (ship_name === "") {
						alert("Please enter a shipment name");
						self.$CreateShipmentName.focus();
						return;
					}

					var new_ship = self.config.model.addShipment(ship_name);

					var ship_id = new_ship.ship_id;

					var $new_Shipment		= $('<div class="Shipment"></div>');
					var $new_ShipmentInner	= $('<div class="ShipmentInner"></div>').appendTo($new_Shipment);
					var $new_ShipmentName	= $('<input class="ShipmentName" placeholder="Shipment Name"/>').val(ship_name).appendTo($new_ShipmentInner);
					var $new_ShipmentWeight = $('<div class="ShipmentWeight"></div>').appendTo($new_ShipmentInner);
					var $new_ShipItems		= $('<div class="ShipItems"></div>').appendTo($new_ShipmentInner);


					$new_ShipmentName.bind("focus blur change",self.eventDelegate);		//bind to input because <div> can't bind focus/blur events

					var $new_item_add = $('<input class="AddItem" type="button" value="Add Item"/>').appendTo($new_ShipmentInner);
					var $new_remove_ship= $('<input class="RemoveShipment" value="Remove Shipment" type="button"/>').appendTo($new_ShipmentInner);

					$new_Shipment.appendTo(self.$Shipments);

					$new_Shipment.find("input").data("ship_id",ship_id);				//attach ship_id to all inputs for use with delegate event handler

					self.viewmodel[new_ship.ship_id] = {
						$Shipment		: $new_Shipment,
						$ShipmentInner	: $new_ShipmentInner,
						$ShipmentName	: $new_ShipmentName,
						$ShipmentWeight	: $new_ShipmentWeight,
						$ShipItems		: $new_ShipItems,
						items			: {}
					};

					self.createItem( ship_id );											//create a new shippint item

					var new_height = $new_ShipmentInner.height();
					$new_Shipment.css({"height":0,"opacity":0}).animate({"height":new_height,"opacity":1},300,function(evt){
						$(this).css({"overflow":"visible","height":"auto"});
					});

					self.$CreateShipmentName.val("");	//reset shipment name input to blank
				}
			},

			RemoveShipment:	{
				/*-----------------------------------------------------------
				* @function		click
				* @memberOf		ViewModel.bindings.RemoveShipment
				* @desc			Removes a shipment from the viewmodel and the model.
				*/
				click:function($elem,evt){
					var ship_id = $elem.data("ship_id");
					self.config.model.removeShipment(ship_id);
					self.viewmodel[ship_id].$ShipmentName.unbind("focus blur change",self.eventDelegate);
					self.viewmodel[ship_id].$Shipment.css("overflow","hidden").animate({"height":0,"opacity":0},300,function(){
						self.viewmodel[ship_id].$Shipment.remove();
						delete self.viewmodel[ship_id];
					});
					self.$CreateShipmentName.focus();
				}
			},

			ShipmentName:	{
				/*-----------------------------------------------------------
				* @function		keyup
				* @memberOf		ViewModel.bindings.ShipmentName
				* @desc			Updates the name of a shipment in the ViewModel and the Model.
				*/
				keyup:	function($elem,evt){
					var ship_id = $elem.data("ship_id");
					self.config.model.setShipmentName(ship_id, $elem.val());
				},

				/*-----------------------------------------------------------
				* @function		change
				* @memberOf		ViewModel.bindings.ShipmentName
				* @desc			Updates the name of a shipment in the ViewModel and the Model.
				*/
				change:	function($elem,evt){
					self.bindings.ShipmentName.keyup($elem,evt);
				},

				/*-----------------------------------------------------------
				* @function		click
				* @memberOf		ViewModel.bindings.ShipmentName
				* @desc			Sets the background-color of the input to white.
				*/
				click:function($elem,evt){
					$elem.css("background-color","white");
				},

				/*-----------------------------------------------------------
				* @function		focus
				* @memberOf		ViewModel.bindings.ShipmentName
				* @desc			Sets the background-color of the input to white.
				*/
				focus:function($elem,evt){
					self.bindings.ShipmentName.click($elem,evt);
				},

				/*-----------------------------------------------------------
				* @function		blur
				* @memberOf		ViewModel.bindings.ShipmentName
				* @desc			Sets the background-color of the input to transparent.
				*/
				blur:function($elem,evt){
					$elem.css("background-color","transparent");
				}
			},

			AddItem:	{
				/*-----------------------------------------------------------
				* @function		click
				* @memberOf		ViewModel.bindings.AddItem
				* @desc			Adds a new item to the ViewModel and the Model.
				*/
				click:	function($elem,evt){
					var ship_id = $elem.data("ship_id");
					self.createItem( ship_id );
				}
			},

			ItemName:	{
				/*-----------------------------------------------------------
				* @function		keyup
				* @memberOf		ViewModel.bindings.ItemName
				* @desc			Updates the item name in the ViewModel and the Model.
				*/
				keyup:	function($elem,evt){
					var ship_id = $elem.data("ship_id");
					var item_id = $elem.data("item_id");
					self.config.model.setItemName(ship_id,item_id,$elem.val());
					if ($elem.val()!="") {
						$elem.removeClass("inputerror");	//if there was an error on this input, clear it.
					}
				},

				/*-----------------------------------------------------------
				* @function		keydown
				* @memberOf		ViewModel.bindings.ItemName
				* @desc			Updates the item name in the ViewModel and the Model.
				*/
				keydown:	function($elem,evt){
					if (evt.keyCode === 13) {
						var ship_id = $elem.data("ship_id");
						var item_id = $elem.data("item_id");
						self.viewmodel[ship_id].items[item_id].$ItemWeight.focus();
						evt.preventDefault();
						evt.stopPropagation();
						return false;
					}
				},

				/*-----------------------------------------------------------
				* @function		change
				* @memberOf		ViewModel.bindings.ItemName
				* @desc			Updates the item name in the ViewModel and the Model.
				*/
				change:	function($elem,evt){
					self.bindings.ItemName.keyup($elem,evt);
				}
			},

			ItemWeight:	{

				/*-----------------------------------------------------------
				* @function		change
				* @memberOf		ViewModel.bindings.ItemWeight
				* @desc			Updates the item weight in the ViewModel and the Model. Also updates the total weight. Advances to next item if [CR] or [TAB] is pressed.
				*/
				keydown:	function($elem,evt){
					if ( self.filterFloatKey($elem,evt) ){
						evt.preventDefault();
						evt.stopPropagation();
						return false;
					}

					$elem.removeClass("inputerror");	//if there was an error on this input, clear it.

					//if the element is the last weight input and carriage-return or tab is pressed, then create a new item automatically
					var thisval = $elem.val();
					var ship_id = $elem.data("ship_id");
					var item_id = $elem.data("item_id");
					if (
						thisval != "" &&
						( evt.keyCode === 13 || (evt.keyCode === 9 && !evt.shiftKey) ) &&
						( self.viewmodel[ship_id].$ShipItems.find(".ItemWeight").last().data("item_id") === $elem.data("item_id") )
					){
						self.createItem(ship_id);

						evt.preventDefault();
						evt.stopPropagation();
						return false
					};

				},

				/*-----------------------------------------------------------
				* @function		keyup
				* @memberOf		ViewModel.bindings.ItemWeight
				* @desc			Updates the item weight in the ViewModel and the Model. Also updates the total weight. Advances to next item if [CR] or [TAB] is pressed.
				*/
				keyup:	function($elem,evt){
					var ship_id = $elem.data("ship_id");
					var item_id = $elem.data("item_id");

					var thisval = $elem.val();

					//be sure that no pasted text breaks the floating point input
					if ( thisval.replace(/[^0-9\.]/g,"") != thisval ) {
						$elem.val(parseFloat(thisval)||"");
					} else {
						var weight = parseFloat(thisval);
						self.setItemWeight(ship_id,item_id,weight);
					}

				},

				/*-----------------------------------------------------------
				* @function		change
				* @memberOf		ViewModel.bindings.ItemWeight
				* @desc			Updates the item weight in the ViewModel and the Model. Also updates the total weight. Advances to next item if [CR] or [TAB] is pressed.
				*/
				change:	function($elem,evt){
					self.bindings.ItemWeight.keyup($elem,evt);
				}
			},


			ItemRemove:	{
				/*-----------------------------------------------------------
				* @function		click
				* @memberOf		ViewModel.bindings.ItemRemove
				* @desc			Removes an item from the ViewModel and the Model. Updates the total weight.
				*/
				click:	function($elem,evt){
					var ship_id = $elem.data("ship_id");
					var item_id = $elem.data("item_id");
					self.config.model.removeItem(ship_id,item_id);
					self.viewmodel[ship_id].items[item_id].$Item.remove();
					delete self.viewmodel[ship_id].items[item_id];
					self.updateShipmentWeight(ship_id);
				}
			}
		},

		//------------------------------------------------------------
		/*
		* @function		setItemWeight
		* @memberOf		ViewModel
		* @desc			Updates item weight and then updates total weight.
		* @param		{string} ship_id, {string} item_id, {float} weight,
		*/
		setItemWeight:	function(ship_id,item_id,weight){
			self.config.model.setItemWeight(ship_id,item_id,weight);
			self.updateShipmentWeight(ship_id);
		},

		//------------------------------------------------------------
		/*
		* @function		updateShipmentWeight
		* @memberOf		ViewModel
		* @desc			Displays the total shipping weight.
		* @param		{string} ship_id
		*/
		updateShipmentWeight:	function(ship_id){
			self.viewmodel[ship_id].$ShipmentWeight.html(" Total Weight: "+ self.config.model.getShipmentTotalWeight(ship_id).toFixed(1) + " lbs");
		},

		//------------------------------------------------------------
		/*
		* @function		createItem
		* @memberOf		ViewModel
		* @desc			Creates new item DOM elements and updates the model.
		* @param		{string} ship_id
		*/
		createItem:	function(ship_id){

			var item_id = self.config.model.addItem(ship_id).item_id;

			var new_item = {
				$Item		: $('<div class="Item"></div>'),
				$ItemName	: $('<input class="ItemName" placeholder="Item Name" type="text" value=""/>'),
				$ItemWeight	: $('<input class="ItemWeight" placeholder="Item Weight" type="text" value=""/>'),
				$ItemRemove	: $('<input class="ItemRemove" type="button" value="Remove"/>')
			};

			self.viewmodel[ship_id].items[item_id] = new_item;

			new_item.$Item.append( new_item.$ItemName , new_item.$ItemWeight , new_item.$ItemRemove);

			new_item.$Item.appendTo(self.viewmodel[ship_id].$ShipItems);

			new_item.$Item.find("*").data({"ship_id":ship_id,"item_id":item_id});

			new_item.$ItemName.focus();

			return {ship_id:ship_id,item_id:item_id};

		},

		//------------------------------------------------------------
		/*
		* @function		filterFloatKey
		* @memberOf		ViewModel
		* @param		{jQuery} $elem, {event object} evt
		* @desc			Use keyCode whitelist to enforce floating point input.
		*
		*	whitelist:
		*	1 = no modifiers
		*	2 = Control key
		*	4 = Alt key
		*	8 = Shift key
		*
		*	example:
		*	  117:6 = ctrl + alt + u
		*	  36:8  = shift + home
		*/

		filterFloatKey:	function($elem,evt){

			var bad_key = true;

			var whitelist = {
				8	:1,	// backspace
				9	:9,	// tab
				13	:1, // return
				35	:9,	// end
				36	:9,	// home
				37	:9,	// left arrow
				39	:9,	// right arrow
				48	:1, // 0
				49	:1, // 1
				50	:1, // 2
				51	:1, // 3
				52	:1, // 4
				53	:1, // 5
				54	:1, // 6
				55	:1, // 7
				56	:1, // 8
				57	:1, // 9
				65	:2,	// ctrl-a
				67	:2,	// ctrl-c
				86	:2,	// ctrl-v
				88	:2,	// ctrl-x
				96	:1, // number pad 0
				97	:1, // number pad 1
				98	:1, // number pad 2
				99	:1, // number pad 3
				100	:1, // number pad 4
				101	:1, // number pad 5
				102	:1, // number pad 6
				103	:1, // number pad 7
				104	:1, // number pad 8
				105	:1, // number pad 9
				110	:1,	// decimal point
				190	:1	// period
			};

			var whitekey = whitelist[evt.keyCode];

			if (
					whitekey != undefined 										&&
					(whitekey&1 && !(evt.ctrlKey||evt.altKey||evt.shiftKey)) 	||
					(whitekey&2 && evt.ctrlKey) 								||
					(whitekey&4 && evt.altKey) 									||
					(whitekey&8 && evt.shiftKey)
			){
				bad_key = false;
			}

			//enforce double decimal point or only decimal point as input
			if (evt.keyCode === 190 && ($elem.val().indexOf(".")!=-1 || $elem.val()==="") ) {bad_key = true};

			return bad_key;
		},

		//---------------------------------------------------------
		/*
		* @function		exportModel
		* @memberOf		ViewModel
		* @desc			Tests input elements for completeness, shows errors if empty inputs exist, or returns the model data as a JSON string.
		* @returns		{string} JSON data from model
		*/
		exportModel:	function(){
			//Test to make sure all DOM elements are filled in before exporting data
			//If a DOM element is missing a value then make the border red indicating a fix is needed

			var has_empty_items = false;

			for (var ship_id in self.viewmodel) {
				for (var item_id in self.viewmodel[ship_id].items) {
					var this_item = self.viewmodel[ship_id].items[item_id];
					if (this_item.$ItemName.val() == "") {
						self.viewmodel[ship_id].items[item_id].$ItemName.addClass("inputerror");
						has_empty_items = true;
					}
					if (this_item.$ItemWeight.val() == "") {
						self.viewmodel[ship_id].items[item_id].$ItemWeight.addClass("inputerror");
						has_empty_items = true;
					}
				}
			}

			if (has_empty_items == true) {
				alert("Some items are missing names or weights");
			} else {
				return self.config.model.exportModel();
			};

		}

	};

	var self = new ViewModel();

	self.init();

	return self
}
