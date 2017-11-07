DROP DATABASE IF EXISTS test;

CREATE DATABASE test;

USE test;

CREATE TABLE seller (
  id int AUTO_INCREMENT NOT NULL,
  name varchar(200),
  PRIMARY KEY (id)
);

CREATE TABLE category (
  id int AUTO_INCREMENT NOT NULL,
  name varchar(200),
  parent_id int DEFAULT NULL,
  PRIMARY KEY (id) 
);

CREATE TABLE item (
  id int AUTO_INCREMENT NOT NULL,
  upc varchar(10),
  name varchar(200),
  brand varchar(200),
  listed_price decimal(7, 2),
  item_desc text,
  updated_at timestamp,
  category_id int,
  PRIMARY KEY (id),
  FOREIGN KEY (category_id) REFERENCES category(id),
  UNIQUE (upc)
);

CREATE TABLE item_detail (
  id int AUTO_INCREMENT NOT NULL,
  item_detail_desc text,
  item_id int,
  PRIMARY KEY (id),
  FOREIGN KEY (item_id) REFERENCES item(id)
);

CREATE TABLE image (
  image_id int AUTO_INCREMENT NOT NULL,
  image_url1 text,
  image_url2 text,
  image_url3 text,
  item_id int,
  PRIMARY KEY (image_id),
  FOREIGN KEY (item_id) REFERENCES item(id)
);

CREATE TABLE seller_item (
  id int AUTO_INCREMENT NOT NULL,
  item_name varchar(200),
  wholesale_price decimal(7, 2),
  quantity int,
  seller_id int,
  item_id int,
  PRIMARY KEY (id),
  FOREIGN KEY (seller_id) REFERENCES seller(id),
  FOREIGN KEY (item_id) REFERENCES item(id)
);

CREATE TABLE item_history (
  id int AUTO_INCREMENT NOT NULL,
  transaction_type text,
  transaction_time timestamp,
  item_id int,
  PRIMARY KEY (id),
  FOREIGN KEY (item_id) REFERENCES item(id)
);



