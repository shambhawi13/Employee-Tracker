var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
    host: "localhost",

    // Your port; if not 3306
    port: 3306,

    // Your username
    user: "root",

    // Your password
    password: "password",
    database: "employeeDB"
});


connection.connect(function (err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId + "\n");
    start();
});

function start() {
    inquirer
        .prompt({
            name: "action",
            type: "list",
            message: "What would you like to do?",
            choices: [
                "Add Employee",
                "View all employee",
                "View all employee by department",
                "View all employee by Manager",
                "Update Employee",
                "Update employee role",
                "Update employee manager",
                "Remove Employee"
            ]
        })
        .then(function (answer) {
            switch (answer.action) {
                case "Add Employee":
                    addEmployee();
                    break;
                case "View all employee":
                    showEmployee();
                    break;
                case "View all employee by department":
                    showEmployeeByDept();
                    break;
                case "View all employee by Manager":
                    showEmployeeByManager();
                    break;
                case "Update Employee":
                    updateEmployee();
                    break;
                case "Update employee role":
                    updateEmployeeByRole();
                    break;
                case "Update employee manager":
                    updateEmployeeByManager();
                    break;
                case "Remove Employee":
                    removeEmployee();
                    break;
                default:
                    console.log("Select a valid CRUD operation");
            }
        });
}

function addEmployee() {
    inquirer
        .prompt({
            name: "fname",
            type: "input",
            message: "What's the employee's first name?"
        },
            {
                name: "lname",
                message: "What's the employee's last name?"
            },
            {
                name: "role",
                type: "list",
                message: "What is the employee role?",
                choices: []
            },
            {
                name: "manager",
                type: "list",
                message: "Who is the employee manager?",
                choices: []
            })
        .then(function (answer) {

        });
}

function showEmployee() {
    var query = `SELECT CONCAT(emp.first_name,' ',emp.last_name) AS name , role.title, role.salary, department.name AS dept, manager_ref.first_name as manager 
    FROM employee AS emp INNER JOIN role ON emp.role_id = role.id 
    INNER JOIN department ON role.department_id = department.id 
    LEFT OUTER JOIN employee AS manager_ref ON emp.manager_id = manager_ref.id;`;
    connection.query(query, function (err, res) {
        for (var i = 0; i < res.length; i++) {
            console.table(res);
        }
        start();
    });
}

function showEmployeeByDept() {
    inquirer.prompt({
        name: "name",
        type: "list",
        message: "What is the department you are looking for?",
        choices: [
            "IT",
            "Sales",
            "Marketing",
            "Design"
        ]
    }).then(function (answer) {
        let query = `SELECT CONCAT(emp.first_name,' ',emp.last_name) AS name , role.title, role.salary, department.name AS dept, manager_ref.first_name as manager 
    FROM employee AS emp INNER JOIN role ON emp.role_id = role.id 
    INNER JOIN department ON role.department_id = department.id 
	LEFT OUTER JOIN employee AS manager_ref ON emp.manager_id = manager_ref.id WHERE ?;`

        connection.query(query, [{ "department.name": answer.name }], function (err, res) {
            for (var i = 0; i < res.length; i++) {
                console.table(res);
            }
        });
    })
}

function showEmployeeByManager() {
    inquirer.prompt({
        name: "name",
        type: "input",
        message: "Enter Manager's first name"
    }).then(function (answer) {
        let query = `SELECT CONCAT(emp.first_name,' ',emp.last_name) AS name , role.title, role.salary, department.name AS dept, manager_ref.first_name as manager 
    FROM employee AS emp INNER JOIN role ON emp.role_id = role.id 
    INNER JOIN department ON role.department_id = department.id 
	LEFT OUTER JOIN employee AS manager_ref ON emp.manager_id = manager_ref.id WHERE ?;`

        connection.query(query, [{ "manager_ref.first_name": answer.name }], function (err, res) {
            for (var i = 0; i < res.length; i++) {
                console.table(res);
            }
        });
    })

}

function updateEmployee() {

}

function updateEmployeeByRole() {

}

function updateEmployeeByManager() {

}

function removeEmployee() {

}


