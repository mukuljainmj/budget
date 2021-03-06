// Budget Controller
var budgetController = (
    function () {
        var Expense = function(id, description, value) {
            this.id = id;
            this.description = description;
            this.value = value;
            this.percentage = -1;
        };
        Expense.prototype.calculatePercentage = function(totalIncome) {
            if (totalIncome > 0) {
                this.percentage = Math.round(this.value / totalIncome * 100);
            } else {
                this.percentage = -1;
            }
        };
        Expense.prototype.getPercentage = function() {
            return this.percentage;
        }
        var Income = function(id, description, value) {
            this.id = id;
            this.description = description;
            this.value = value;
        };
        // calculate total (expenses or income)
        // we need to update this method in future
        calculateTotal = function(type) {
            var sum = 0;
            data.allItems[type].forEach(function(current) {
                sum += current.value;
            });
            data.totals[type] = sum;
        };
        // data structure
        var data = {
            allItems: {
                exp: [],
                inc: []
            },
            totals: {
                exp: 0,
                inc: 0
            },
            budget: 0,
            percentage: -1
        };
        return {
            addItem: function(type, des, val) {
                var newItem, id, length;
                // create new id
                // id = lastElement's id + 1
                length = data.allItems[type].length;
                if (length > 0) {
                    id = data.allItems[type][length - 1].id + 1;
                } else {
                    id = 0;
                }
                // create new item based on 'exp' or 'inc'
                if (type === 'exp') {
                    newItem = new Expense(id, des, val);
                } else if (type === 'inc') {
                    newItem = new Income(id, des, val);
                }
                // add item to data structure
                data.allItems[type].push(newItem);
                // return new item
                return newItem;
            },
            deleteItem: function(type, id) {
                // [{id: 1, description: 'itemA', value: 10}, {id: 3, description: 'itemB', value: 20}];
                // using map create an ids array -> [1,3];
                var ids, index;
                ids = data.allItems[type].map(function(current) {
                    return current.id;
                });
                index = ids.indexOf(id);
                index !== -1 ? data.allItems[type].splice(index, 1) : console.log('id not found');
            },
            calculateBudget: function() {
                // Calculate total income and total expenses
                calculateTotal('exp');
                calculateTotal('inc');
                // Calculate budget
                data.budget = data.totals.inc - data.totals.exp;
                // Calculate percentage of income that we spent
                if (data.totals.inc > 0) {
                    data.percentage = Math.round(data.totals.exp / data.totals.inc * 100);
                } else {
                    data.percentage = -1;
                }
            },
            getBudget: function() {
                return {
                    totalExpenses: data.totals.exp,
                    totalIncome: data.totals.inc,
                    budget: data.budget,
                    percentage: data.percentage
                }
            },
            calculatePercentages: function() {
                data.allItems.exp.forEach(function(current) {
                    current.calculatePercentage(data.totals.inc);
                });
            },
            getPercentages: function() {
                return data.allItems.exp.map(function(current) {
                    return current.percentage
                });
            },
            testing: function() {
                console.log(data);
            }
        }
    }
)();

// UI Controller
var uiController = (
    function () {
        var domString = {
            inputType: '.add__type',
            inputDescription: '.add__description',
            inputValue: '.add__value',
            inputButton: '.add__btn',
            expensesContainer: '.expenses__list',
            incomeContainer: '.income__list',
            budgetLabel: '.budget__value',
            totalIncomeLabel: '.budget__income--value',
            totalExpensesLabel: '.budget__expenses--value',
            percentageLabel: '.budget__expenses--percentage',
            container: '.container',
            expPercentageLabel: '.item__percentage'
        };
        var formatNumber = function (num, type) {
            // 1. + or -
            // 2. exactly 2 decimals
            // 3. , 
            var numberSplit, int, dec;
            num = Math.abs(num).toFixed(2);
            numberSplit = num.split('.');
            int = numberSplit[0];
            dec = numberSplit[1];
            if (int.length > 3) {
                int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
            }
            return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
        };
        return {
            getInput: function() {
                return {
                    type: document.querySelector(domString.inputType).value, // will be either 'inc' or 'exp'
                    description: document.querySelector(domString.inputDescription).value,
                    value: parseFloat(document.querySelector(domString.inputValue).value)
                }
            },
            getDomString: function() {
                return domString;
            },
            addListItem: function(object, type) {
                var html, dataHtml, element;
                // Create html string with placeholder text
                if (type === 'exp') {
                    element = domString.expensesContainer;
                    html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
                } else if (type === 'inc') {
                    element = domString.incomeContainer;
                    html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
                }
                // Replace placeholder text with data
                dataHtml = html.replace('%id%', object.id);
                dataHtml = dataHtml.replace('%description%', object.description);
                dataHtml = dataHtml.replace('%value%', formatNumber(object.value, type));
                // Insert dataHtml into DOM
                document.querySelector(element).insertAdjacentHTML('beforeend', dataHtml);
            },
            deleteListItem: function(selectorId) {
                var element = document.getElementById(selectorId);
                element.parentNode.removeChild(element);
            },
            clearFields: function() {
                var fields;
                fields = document.querySelectorAll(domString.inputDescription + ', ' + domString.inputValue);
                fields.forEach(function(current) {
                    current.value = '';
                });
                fields[0].focus();
            },
            displayBudget: function(budget) {
                var type;
                budget.budget > 0 ? type = 'inc' : type = 'exp';
                document.querySelector(domString.budgetLabel).textContent = formatNumber(budget.budget, type);
                document.querySelector(domString.totalIncomeLabel).textContent = formatNumber(budget.totalIncome, 'inc');
                document.querySelector(domString.totalExpensesLabel).textContent = formatNumber(budget.totalExpenses, 'exp');
                if (budget.percentage > 0) {
                    document.querySelector(domString.percentageLabel).textContent = budget.percentage + '%';
                } else {
                    document.querySelector(domString.percentageLabel).textContent = '--';
                }
            },
            displayPercentages: function(percentages) {
                var fields = document.querySelectorAll(domString.expPercentageLabel);
                // creating our own forEach function
                var nodeListForEach = function(list, callBack) {
                    for (var index = 0; index < list.length; index++) {
                        callBack(list[index], index);
                    }
                }
                nodeListForEach(fields, function(current, index) {
                    if (percentages[index] > 0) {
                        current.textContent = percentages[index] + '%';
                    } else {
                        current.textContent = '--';
                    }
                })
            }
        }
    }
)();

// App Controller (Global)
var controller = (
    function(budgetCtrl, uiCtrl) {
        var setEventListener = function() {
            var domString = uiCtrl.getDomString();
            document.querySelector(domString.inputButton).addEventListener('click', ctrlAddItem)
            document.addEventListener('keypress', function(event) {
                if (event.keyCode === 13) {
                    ctrlAddItem();
                }
            });
            document.querySelector(domString.container).addEventListener('click', ctrlDeleteItem);
        };
        var updateBudget = function() {
            // 1. Calculate the budget
            budgetCtrl.calculateBudget();
            // 2. Return budget
            var budget = budgetCtrl.getBudget();
            // 3. Display the budget on ui
            uiCtrl.displayBudget(budget);
        };
        var updatePercentages = function() {
            // 1. Calculate percentages
            budgetCtrl.calculatePercentages();
            // 2. Return percentages
            var percentages = budgetCtrl.getPercentages();
            // 3. Update UI with updated percentages
            uiCtrl.displayPercentages(percentages);
        }
        var ctrlAddItem = function() {
            var input, newItem;
            // 1. Get the field input
            input = uiCtrl.getInput();
            // Add item if input is valid
            if (input.description !== '' && !isNaN(input.value)) {
                // 2. Add the item to the budget controller
                newItem = budgetCtrl.addItem(input.type, input.description, input.value);
                // 3. Add the item to the ui controller
                uiCtrl.addListItem(newItem, input.type);
                // 4. Clear input fields
                uiCtrl.clearFields();
                // 5. Calculate budget and display budget in UI
                updateBudget();
                // 6. Calculate percentages and display in Ui
                updatePercentages();
            }
        };
        ctrlDeleteItem = function(event) {
            var itemId, splitId, type, id;
            itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;
            // Change this if logic argument in future
            if (itemId) {
                splitId = itemId.split('-');
                type = splitId[0];
                id = parseInt(splitId[1]);
                // Delete the item from data structure
                budgetCtrl.deleteItem(type, id);
                // Delete the item from ui
                uiCtrl.deleteListItem(itemId);
                // Update budget
                updateBudget();
                // Calculate percentages and display in Ui
                updatePercentages();
            }
        };
        return {
            init: function () {
                console.log('app has started');
                uiCtrl.displayBudget({
                    totalExpenses: 0,
                    totalIncome: 0,
                    budget: 0,
                    percentage: -1
                })
                setEventListener();
            }
        };
    }
)(budgetController, uiController)
controller.init();