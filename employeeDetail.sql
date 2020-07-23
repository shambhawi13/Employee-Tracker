DROP DATABASE IF EXISTS employeeDB;
CREATE database employeeDB;

USE employeeDB;

CREATE TABLE department(
    id INTEGER AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(30) NOT NULL
);

CREATE TABLE role(
    id INTEGER AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(30) NOT NULL,
    salary DECIMAL,
    department_id INTEGER
);

CREATE TABLE employee(
    id INTEGER AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(30),
    last_name VARCHAR(30),
    role_id INTEGER,
    manager_id INTEGER NULL
);

INSERT INTO department(name) VALUES("IT");
INSERT INTO department(name) VALUES("MARKETING");

INSERT INTO role(title,salary,department_id) VALUES("Engineer",9000,1);
INSERT INTO role(title,salary,department_id) VALUES("Consultant",8000,2);

INSERT INTO employee(first_name,last_name,role_id,manager_id) VALUES("Shambhawi","Kumari",1,null);
INSERT INTO employee(first_name,last_name,role_id,manager_id) VALUES("Raj","Kumar",1,1);
INSERT INTO employee(first_name,last_name,role_id,manager_id) VALUES("Raj","Kumar",2,null);

SELECT * FROM employee;
SELECT * FROM role;
SELECT * FROM department;