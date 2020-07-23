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
                "Remove Employee",
                "Exit"
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
                case "Exit":  
                    break;
                default:
                    console.log("Select a valid CRUD operation");
            }
        });
}

function addEmployee() {
    // get all roles
    var role_query = `SELECT * FROM role;`;
    connection.query(role_query, function (err, roles) {
        if (err) throw err;
        let roleNames = roles.map(role => {
            return role.title;
        });

        //get all manager name(indirectly all employee's name)
        let employee_query = `SELECT * FROM employee;`;
        connection.query(employee_query, function (err, employeesManager) {
            if (err) throw err;

            let managerNames = employeesManager.map(employee => {
                return (employee.first_name + " " + employee.last_name);
            });

            //prompt user
            inquirer
                .prompt([
                    {
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
                        choices: roleNames
                    },
                    {
                        name: "manager",
                        type: "list",
                        message: "Who is the employee manager?",
                        choices: managerNames
                    }])
                .then(function (answer) {
                    console.log(answer);
                    //find id of role selected
                    let selectedRoleId = null;
                    for (let i = 0; i < roles.length; i++) {
                        if (roles[i].title === answer.role) {
                            selectedRoleId = roles[i].id;
                        }
                    }
                    //find id of employee name selected
                    let managerId = null;
                    for (let i = 0; i < employeesManager.length; i++) {
                        let fullName = employeesManager[i].first_name + ' ' + employeesManager[i].last_name;
                        if (fullName === answer.manager) {
                            managerId = employeesManager[i].id;
                        }
                    }

                    // write query to insert this employee table
                    console.log(answer.fname, answer.lname, selectedRoleId, managerId);
                    let insertQuery = "INSERT INTO employee(first_name,last_name,role_id,manager_id) VALUES(?,?,?,?);"
                    connection.query(insertQuery, [answer.fname, answer.lname, selectedRoleId, managerId], function (err, result) {
                        console.log(result.affectedRows, ' rows inserted');
                        start();
                    })
                });

        });
    });

}

function showEmployee() {
    var query = `SELECT CONCAT(emp.first_name,' ',emp.last_name) AS name , role.title, role.salary, department.name AS dept, manager_ref.first_name as manager 
    FROM employee AS emp INNER JOIN role ON emp.role_id = role.id 
    INNER JOIN department ON role.department_id = department.id 
    LEFT OUTER JOIN employee AS manager_ref ON emp.manager_id = manager_ref.id;`;
    connection.query(query, function (err, res) {
        console.table(res);
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
            //for (var i = 0; i < res.length; i++) {
                console.table(res);
                start();
            //}
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
            //for (var i = 0; i < res.length; i++) {
                console.table(res);
                start();
            //}
        });
    })

}

function updateEmployee() {
    let query = "SELECT * FROM employee";
    connection.query(query, function (err, result) {
        let employeeNames = result.map(employee => {
            return (employee.first_name + " " + employee.last_name);
        });
        inquirer.prompt([
            {
                type: 'list',
                name: 'name',
                message: "Which employee's record you want to update?",
                choices: employeeNames
            },
            {
                type: 'list',
                name: 'record',
                message: "Which record you want to update?",
                choices: ["name", "role", "manager"]
            },
            {
                name: 'changeValue',
                message: 'Enter new value you want to update?'
            }
        ]).then(function (answer) {
            //find id of employee
            let selectedEmpId = result.filter(function (emp) {
                let fname = emp.first_name + ' ' + emp.last_name;
                return fname === answer.name;
            });
            selectedEmpId = selectedEmpId[0].id;
            console.log(selectedEmpId);
            switch (answer.record) {
                case "name":
                    let firstName = answer.changeValue.split(" ")[0];
                    let lastName = answer.changeValue.split(" ")[1];
                    console.log(firstName, lastName);
                    let updateNameQuery = `UPDATE employee SET ?,? WHERE ?`;
                    connection.query(updateNameQuery,
                        [{ first_name: firstName },
                        { last_name: lastName },
                        { id: selectedEmpId }
                        ], function (err, result) {
                            if (err) throw err;
                            console.log("Updated", result);
                        });
                    break;
                case "role":
                    // get all roles
                    var role_query = `SELECT * FROM role;`;
                    connection.query(role_query, function (err, roles) {
                        if (err) throw err;
                        let roleId;
                        for (let i = 0; i < roles.length; i++) {
                            if (roles[i].title == answer.changeValue) {
                                roleId = roles[i].id;
                            }
                        }
                        console.log('roleid', roleId);
                        let updateNameQuery = `UPDATE employee SET ? WHERE ?;`;
                        connection.query(updateNameQuery,
                            [{ role_id: roleId },
                            { id: selectedEmpId }
                            ], function (err, result) {
                                if (err) throw err;
                                console.log("Updated", result);
                                start();
                            });

                    });
                    break;
                case "manager":
                    //console.log(result,answer.changeValue);
                    let managerId;
                    for (let i = 0; i < result.length; i++) {
                        //console.log(result[i],result[i].id);
                        let managerName = result[i].first_name + ' ' + result[i].last_name;
                        if (managerName == answer.changeValue) {
                            managerId = result[i].id;
                        }
                    }
                    console.log(managerId);
                    let updateManagerQuery = `UPDATE employee SET ? WHERE ?;`;
                    connection.query(updateManagerQuery,
                        [{ manager_id: managerId },
                        { id: selectedEmpId }
                        ], function (err, result) {
                            if (err) throw err;
                            console.log("Updated", result);
                            start();
                        });
                    break;
            }
        })
    });

}

function updateEmployeeByRole() {

    let query = "SELECT * FROM employee";
    connection.query(query, function (err, result) {
        let employeeNames = result.map(employee => {
            return (employee.first_name + " " + employee.last_name);
        });
        connection.query('SELECT * FROM role', function (err, allRoles) {
            let allRoleTitle = allRoles.map(role => role.title);

            inquirer.prompt([
                {
                    type: 'list',
                    name: 'name',
                    message: "Which employee's record you want to update?",
                    choices: employeeNames
                },
                {
                    type: 'list',
                    name: 'changeValue',
                    message: 'Select a role you want to update to?',
                    choices: allRoleTitle
                }
            ]).then(function (answer) {
                //find id of employee
                let selectedEmpId = result.filter(function (emp) {
                    let fname = emp.first_name + ' ' + emp.last_name;
                    return fname === answer.name;
                });
                selectedEmpId = selectedEmpId[0].id;

                let selectedRoleId = allRoles.filter(function (r) {
                    return r.title == answer.changeValue;
                });
                selectedRoleId = selectedRoleId[0].id;
                let updateNameQuery = `UPDATE employee SET ? WHERE ?;`;
                connection.query(updateNameQuery,
                    [{ role_id: selectedRoleId },
                    { id: selectedEmpId }
                    ], function (err, result) {
                        if (err) throw err;
                        console.log("Updated", result);
                        start();
                    });
            });
        });
    });

}

function updateEmployeeByManager() {
    let query = "SELECT * FROM employee";
    connection.query(query, function (err, result) {
        let employeeNames = result.map(employee => {
            return (employee.first_name + " " + employee.last_name);
        });
        connection.query('SELECT * FROM role', function (err, allRoles) {
            let allRoleTitle = allRoles.map(role => role.title);

            inquirer.prompt([
                {
                    type: 'list',
                    name: 'name',
                    message: "Which employee's record you want to update?",
                    choices: employeeNames
                },
                {
                    type: 'list',
                    name: 'changeValue',
                    message: 'Select the manager you want to update to?',
                    choices: employeeNames
                }
            ]).then(function (answer) {
                //find id of employee
                let selectedEmpId = result.filter(function (emp) {
                    let fname = emp.first_name + ' ' + emp.last_name;
                    return fname === answer.name;
                });
                selectedEmpId = selectedEmpId[0].id;

                let selectedManagerId = result.filter(function (emp) {
                    let fname = emp.first_name + ' ' + emp.last_name;
                    return fname === answer.changeValue;
                });

                selectedManagerId = selectedManagerId[0].id;
                console.log(selectedManagerId);
                let updateNameQuery = `UPDATE employee SET ? WHERE ?;`;
                connection.query(updateNameQuery,
                    [{ manager_id : selectedManagerId },
                    { id: selectedEmpId }
                    ], function (err, result) {
                        if (err) throw err;
                        console.log("Updated", result);
                        start();
                    });
            });
        });
    });
}

function removeEmployee() {
    let query = "SELECT * FROM employee";
    connection.query(query, function (err, result) {
        if (err) throw err;
        let employeeNames = result.map(employee => {
            return (employee.first_name + " " + employee.last_name);
        });
        inquirer.prompt(
            {
                type:'list',
                name: 'empName',
                message: 'Select the employee you want to delete?',
                choices: employeeNames
            }
        ).then(function(answer){
            console.log(answer);
            //find employeeId
            let selectedEmpId = result.filter(function(emp){
                let name = emp.first_name + ' ' + emp.last_name;
                return name == answer.empName;
            });
            selectedEmpId = selectedEmpId[0].id;
            console.log(selectedEmpId);
            if (err) throw err;
            let delQuery = `DELETE FROM employee WHERE ?;`
            connection.query(delQuery,[{id:selectedEmpId}],function(err,response){
                if (err) throw err;
                console.log('Deleted');
                start();
            })
        })
    });
}


