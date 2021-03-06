define( [
	"jquery",
	"./helper",
	"ui/widgets/datepicker"
], function( $, testHelper ) {

module("datepicker: events");

var selectedThis = null,
selectedDate = null,
selectedInst = null;

function callback(date, inst) {
	selectedThis = this;
	selectedDate = date;
	selectedInst = inst;
}

function callback2(year, month, inst) {
	selectedThis = this;
	selectedDate = year + "/" + month;
	selectedInst = inst;
}

test("events", function() {
	expect( 26 );
	var dateStr, newMonthYear, inp2,
		inp = testHelper.init("#inp", {onSelect: callback}),
	date = new Date();
	// onSelect
	inp.val("").datepicker("show").
		simulate("keydown", {keyCode: $.ui.keyCode.ENTER});
	equal(selectedThis, inp[0], "Callback selected this");
	equal(selectedInst, $.data(inp[0], testHelper.PROP_NAME), "Callback selected inst");
	equal(selectedDate, $.datepicker.formatDate("mm/dd/yy", date),
		"Callback selected date");
	inp.val("").datepicker("show").
		simulate("keydown", {ctrlKey: true, keyCode: $.ui.keyCode.DOWN}).
		simulate("keydown", {keyCode: $.ui.keyCode.ENTER});
	date.setDate(date.getDate() + 7);
	equal(selectedDate, $.datepicker.formatDate("mm/dd/yy", date),
		"Callback selected date - ctrl+down");
	inp.val("").datepicker("show").
		simulate("keydown", {keyCode: $.ui.keyCode.ESCAPE});
	equal(selectedDate, $.datepicker.formatDate("mm/dd/yy", date),
		"Callback selected date - esc");
    dateStr = "02/04/2008";
    inp.val(dateStr).datepicker("show").
        simulate("keydown", {keyCode: $.ui.keyCode.ENTER});
    equal(dateStr, selectedDate,
        "onSelect is called after enter keydown");
	// onChangeMonthYear
	inp.datepicker("option", {onChangeMonthYear: callback2, onSelect: null}).
		val("").datepicker("show");
	newMonthYear = function(date) {
		return date.getFullYear() + "/" + (date.getMonth() + 1);
	};
	date = new Date();
	date.setDate(1);
	inp.simulate("keydown", {keyCode: $.ui.keyCode.PAGE_UP});
	date.setMonth(date.getMonth() - 1);
	equal(selectedThis, inp[0], "Callback change month/year this");
	equal(selectedInst, $.data(inp[0], testHelper.PROP_NAME), "Callback change month/year inst");
	equal(selectedDate, newMonthYear(date),
		"Callback change month/year date - pgup");
	inp.simulate("keydown", {keyCode: $.ui.keyCode.PAGE_DOWN});
	date.setMonth(date.getMonth() + 1);
	equal(selectedDate, newMonthYear(date),
		"Callback change month/year date - pgdn");
	inp.simulate("keydown", {ctrlKey: true, keyCode: $.ui.keyCode.PAGE_UP});
	date.setFullYear(date.getFullYear() - 1);
	equal(selectedDate, newMonthYear(date),
		"Callback change month/year date - ctrl+pgup");
	inp.simulate("keydown", {ctrlKey: true, keyCode: $.ui.keyCode.HOME});
	date.setFullYear(date.getFullYear() + 1);
	equal(selectedDate, newMonthYear(date),
		"Callback change month/year date - ctrl+home");
	inp.simulate("keydown", {ctrlKey: true, keyCode: $.ui.keyCode.PAGE_DOWN});
	date.setFullYear(date.getFullYear() + 1);
	equal(selectedDate, newMonthYear(date),
		"Callback change month/year date - ctrl+pgdn");
	inp.datepicker("setDate", new Date(2007, 1 - 1, 26));
	equal(selectedDate, "2007/1", "Callback change month/year date - setDate");
	selectedDate = null;
	inp.datepicker("setDate", new Date(2007, 1 - 1, 12));
	ok(selectedDate == null, "Callback change month/year date - setDate no change");
	// onChangeMonthYear step by 2
	inp.datepicker("option", {stepMonths: 2}).
		datepicker("hide").val("").datepicker("show").
		simulate("keydown", {keyCode: $.ui.keyCode.PAGE_UP});
	date.setMonth(date.getMonth() - 14);
	equal(selectedDate, newMonthYear(date),
		"Callback change month/year by 2 date - pgup");
	inp.simulate("keydown", {ctrlKey: true, keyCode: $.ui.keyCode.PAGE_UP});
	date.setMonth(date.getMonth() - 12);
	equal(selectedDate, newMonthYear(date),
		"Callback change month/year by 2 date - ctrl+pgup");
	inp.simulate("keydown", {keyCode: $.ui.keyCode.PAGE_DOWN});
	date.setMonth(date.getMonth() + 2);
	equal(selectedDate, newMonthYear(date),
		"Callback change month/year by 2 date - pgdn");
	inp.simulate("keydown", {ctrlKey: true, keyCode: $.ui.keyCode.PAGE_DOWN});
	date.setMonth(date.getMonth() + 12);
	equal(selectedDate, newMonthYear(date),
		"Callback change month/year by 2 date - ctrl+pgdn");
	// onClose
	inp.datepicker("option", {onClose: callback, onChangeMonthYear: null, stepMonths: 1}).
		val("").datepicker("show").
		simulate("keydown", {keyCode: $.ui.keyCode.ESCAPE});
	equal(selectedThis, inp[0], "Callback close this");
	equal(selectedInst, $.data(inp[0], testHelper.PROP_NAME), "Callback close inst");
	equal(selectedDate, "", "Callback close date - esc");
	inp.val("").datepicker("show").
		simulate("keydown", {keyCode: $.ui.keyCode.ENTER});
	equal(selectedDate, $.datepicker.formatDate("mm/dd/yy", new Date()),
		"Callback close date - enter");
	inp.val("02/04/2008").datepicker("show").
		simulate("keydown", {keyCode: $.ui.keyCode.ESCAPE});
	equal(selectedDate, "02/04/2008", "Callback close date - preset");
	inp.val("02/04/2008").datepicker("show").
		simulate("keydown", {ctrlKey: true, keyCode: $.ui.keyCode.END});
	equal(selectedDate, "", "Callback close date - ctrl+end");

	inp2 = testHelper.init("#inp2");
	inp2.datepicker().datepicker("option", {onClose: callback}).datepicker("show");
	inp.datepicker("show");
	equal(selectedThis, inp2[0], "Callback close this");
});

test("beforeShowDay-getDate", function() {
	expect( 3 );
	var inp = testHelper.init("#inp", {beforeShowDay: function() { inp.datepicker("getDate"); return [true, ""]; }}),
		dp = $("#ui-datepicker-div");
	inp.val("01/01/2010").datepicker("show");
	// contains non-breaking space
	equal($("div.ui-datepicker-title").text(),
		// support: IE <9, jQuery <1.8
		// In IE7/8 with jQuery <1.8, encoded spaces behave in strange ways
		$( "<span>January&#xa0;2010</span>" ).text(), "Initial month");
	$("a.ui-datepicker-next", dp).trigger( "click" );
	$("a.ui-datepicker-next", dp).trigger( "click" );
	// contains non-breaking space
	equal($("div.ui-datepicker-title").text(),
		$( "<span>March&#xa0;2010</span>" ).text(), "After next clicks");
	inp.datepicker("hide").datepicker("show");
	$("a.ui-datepicker-prev", dp).trigger( "click" );
	$("a.ui-datepicker-prev", dp).trigger( "click" );
	// contains non-breaking space
	equal($("div.ui-datepicker-title").text(),
		$( "<span>November&#xa0;2009</span>" ).text(), "After prev clicks");
	inp.datepicker("hide");
});

} );
