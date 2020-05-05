-- Created by Vertabelo (http://vertabelo.com)
-- Last modification date: 2020-04-28 21:06:26.157

-- foreign keys
ALTER TABLE Auth_token
    DROP FOREIGN KEY Auth_token_User;

ALTER TABLE Followers
    DROP FOREIGN KEY Followers_User;

ALTER TABLE Following
    DROP FOREIGN KEY Following_User;

ALTER TABLE Password_Reset
    DROP FOREIGN KEY Password_Reset_User;

ALTER TABLE Stock_Collection
    DROP FOREIGN KEY Stock_Collection_User;

-- tables
DROP TABLE Auth_token;

DROP TABLE Followers;

DROP TABLE Following;

DROP TABLE Password_Reset;

DROP TABLE Stock_Collection;

DROP TABLE User;

-- End of file.

