// Budget Controller
var budgetController = (
    function () {
        var Expense = function(id, description, value) {
            this.id = id;
            this.description = description;
            this.value = value;
        }
        var Income = function(id, description, value) {
            this.id = id;
            this.description = description;
            this.value = value;
        }
        // calculate total (expenses or income)
        calculateTotal = function(type) {
            var sum = 0;
            data.allItems[type].forEach(function(current) {
                sum += current.value;
            });
            data.totals[type] = sum;
        }
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
        }
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
            calculateBudget: function() {
                // Calculate total income and total expenses
                calculateTotal('exp');
                calculateTotal('inc');
                // Calculate budget
                data.budget = data.totals.inc - data.totals.exp;
                // Calculate percentage of income that we spent
                if (data.totals.inc > 0) {
                    data.percentage = data.totals.exp / data.totals.inc * 100;
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
            percentageLabel: '.budget__expenses--percentage'
        }
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
                    html = '<div class="item clearfix" id="expense-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
                } else if (type === 'inc') {
                    element = domString.incomeContainer;
                    html = '<div class="item clearfix" id="income-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
                }
                // Replace placeholder text with data
                dataHtml = html.replace('%id%', object.id);
                dataHtml = dataHtml.replace('%description%', object.description);
                dataHtml = dataHtml.replace('%value%', object.value);
                // Insert dataHtml into DOM
                document.querySelector(element).insertAdjacentHTML('beforeend', dataHtml);
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
                document.querySelector(domString.budgetLabel).textContent = budget.budget;
                document.querySelector(domString.totalIncomeLabel).textContent = budget.totalIncome;
                document.querySelector(domString.totalExpensesLabel).textContent = budget.totalExpenses;
                if (budget.percentage > 0) {
                    document.querySelector(domString.percentageLabel).textContent = budget.percentage + '%';
                } else {
                    document.querySelector(domString.percentageLabel).textContent = '--';
                }
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
            })
        }
        var updateBudget = function() {
            // 1. Calculate the budget
            budgetCtrl.calculateBudget();
            // 2. Return budget
            var budget = budgetCtrl.getBudget();
            // 3. Display the budget on ui
            uiCtrl.displayBudget(budget);
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
            }
        }
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
        }
    }
)(budgetController, uiController)
controller.init();