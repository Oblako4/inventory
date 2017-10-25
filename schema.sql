DROP DATABASE IF EXISTS inventory;

CREATE DATABASE inventory;

USE inventory;

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
  seller_id int,
  category_id int,
  PRIMARY KEY (id),
  FOREIGN KEY (seller_id) REFERENCES seller(id),
  FOREIGN KEY (category_id) REFERENCES category(id)
);

CREATE TABLE item_detail (
  id int AUTO_INCREMENT NOT NULL,
  item_detail_desc text,
  item_id int,
  PRIMARY KEY (id),
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

CREATE TABLE image (
  image_id int AUTO_INCREMENT NOT NULL,
  image_url1 text,
  image_url2 text,
  image_url3 text,
  item_id int,
  PRIMARY KEY (image_id),
  FOREIGN KEY (item_id) REFERENCES item(id)
);

ALTER TABLE item 
ADD COLUMN image_id int NOT NULL AFTER category_id;

ALTER TABLE item 
ADD FOREIGN KEY fk_image(image_id)
REFERENCES image(image_id)
ON DELETE NO ACTION
ON UPDATE CASCADE;

ALTER TABLE item 
ADD COLUMN item_detail_id int NOT NULL AFTER image_id;

ALTER TABLE item 
ADD FOREIGN KEY fk_item_detail(item_detail_id)
REFERENCES item_detail(id)
ON DELETE NO ACTION
ON UPDATE CASCADE;


