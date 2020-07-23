INSERT INTO department(name) VALUES("IT");
INSERT INTO department(name) VALUES("MARKETING");

INSERT INTO role(title,salary,department_id) VALUES("Engineer",9000,1);
INSERT INTO role(title,salary,department_id) VALUES("Consultant",8000,2);

INSERT INTO employee(first_name,last_name,role_id,manager_id) VALUES("Shambhawi","Kumari",1,null);
INSERT INTO employee(first_name,last_name,role_id,manager_id) VALUES("Raj","Kumar",1,1);
INSERT INTO employee(first_name,last_name,role_id,manager_id) VALUES("Raj","Kumar",2,null);