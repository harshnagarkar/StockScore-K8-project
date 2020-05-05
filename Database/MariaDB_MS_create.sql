-- Created by Vertabelo (http://vertabelo.com)
-- Last modification date: 2020-04-28 21:06:26.157

-- tables
-- Table: Auth_token
CREATE TABLE Auth_token (
    User_email varchar(255) NOT NULL,
    refresh_token varchar(256) NOT NULL,
    expiry timestamp NOT NULL,
    CONSTRAINT Auth_token_pk PRIMARY KEY (User_email)
);

-- Table: Followers
CREATE TABLE Followers (
    User_email varchar(255) NOT NULL,
    id int NOT NULL,
    email varchar(255) NOT NULL,
    CONSTRAINT Followers_pk PRIMARY KEY (id)
);

-- Table: Following
CREATE TABLE Following (
    User_email varchar(255) NOT NULL,
    id int NOT NULL,
    email varchar(255) NOT NULL,
    CONSTRAINT Following_pk PRIMARY KEY (id)
);

-- Table: Password_Reset
CREATE TABLE Password_Reset (
    User_email varchar(255) NOT NULL,
    code varchar(20) NULL,
    CONSTRAINT Password_Reset_pk PRIMARY KEY (User_email)
);

-- Table: Stock_Collection
CREATE TABLE Stock_Collection (
    User_email varchar(255) NOT NULL,
    stock varchar(6) NOT NULL,
    vote bool NOT NULL,
    vote_datetime timestamp NULL,
    recent_predictions int NULL,
    recent_correct bool NOT NULL,
    total_predictions int NULL,
    correct_predictions int NULL,
    CONSTRAINT Stock_Collection_pk PRIMARY KEY (User_email,stock)
);

-- Table: User
CREATE TABLE User (
    email varchar(255) NOT NULL,
    password varchar(128) NOT NULL,
    accuracy int NOT NULL DEFAULT 1,
    total_predictions int NOT NULL DEFAULT 0,
    correct_predictions double(10,10) NOT NULL DEFAULT 0,
    name varchar(200) NOT NULL,
    profileimage varchar(10000) NULL,
    score double(10,10) NOT NULL,
    CONSTRAINT User_pk PRIMARY KEY (email)
);

-- foreign keys
-- Reference: Auth_token_User (table: Auth_token)
ALTER TABLE Auth_token ADD CONSTRAINT Auth_token_User FOREIGN KEY Auth_token_User (User_email)
    REFERENCES User (email);

-- Reference: Followers_User (table: Followers)
ALTER TABLE Followers ADD CONSTRAINT Followers_User FOREIGN KEY Followers_User (User_email)
    REFERENCES User (email);

-- Reference: Following_User (table: Following)
ALTER TABLE Following ADD CONSTRAINT Following_User FOREIGN KEY Following_User (User_email)
    REFERENCES User (email);

-- Reference: Password_Reset_User (table: Password_Reset)
ALTER TABLE Password_Reset ADD CONSTRAINT Password_Reset_User FOREIGN KEY Password_Reset_User (User_email)
    REFERENCES User (email);

-- Reference: Stock_Collection_User (table: Stock_Collection)
ALTER TABLE Stock_Collection ADD CONSTRAINT Stock_Collection_User FOREIGN KEY Stock_Collection_User (User_email)
    REFERENCES User (email);

-- End of file.

