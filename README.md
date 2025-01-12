# 🎥 Demo Video
https://drive.google.com/file/d/1kxQCpcfV5WFW9u2mclYKjK9oxeQEAsW1/view?usp=sharing

# 📷 Screenshot

![chatPlus-image](https://github.com/user-attachments/assets/44a89d18-0a03-4198-b3d7-0d4ca7e49f86)

# ⭐ Product and User Management

- Real-time Messaging: This chat application enables real-time, two-way communication between users, with seamless message exchange and updates.

- User Interaction: Users can select from a list of available users, send messages, and view chat histories, making it ideal for basic chat functionalities.

- Socket.IO Integration: Leveraging Socket.IO, this application provides efficient real-time messaging by connecting users to dedicated rooms based on their usernames.

# 🕸 Screenshot
![workflow](https://github.com/user-attachments/assets/9022c640-2184-4006-8d09-9c2134985ed2)


## 🛠️ Installation

Install my-project with npm

```bash
  git clone https://github.com/Ariyaan321/ChatPlus.git
  cd ChatPlus
```
## 🧰 Setup backend/server

```bash
  npm install  // to install all the dependencies in package.json
  touch .env
```
- Add the following in you **.env** file
```
PORT=8080
MONGO_DB_URI='mongodb+srv://mongo:<password>@cluster0.xnxu3xy.mongodb.net/<nameOfDB>?retryWrites=true&w=majority
```
- make sure to add your own password and DB name to connect with your cluster

### Now start the server 
```bash
  \ChatPlus> npm run server
```
- You should now see the following output in the terminal
```bash
  Chat app listening on port 8080
  Database connected!
```
- 🎉 Congratulations you server is now running on port 8080 !!

## ⚛️ Setup frontend/react

- Now navigate to the **fronted** directory ( i.e., \ChatPlus\frontend> )

```bash
  npm install   // this will install react
  npm start   // start the application
```

- 🎊 Woooo... now both of your frontend and backend application are up and running !!

## ⛓ API Reference

#### Get all users

```http
  GET http://localhost:8080/users
```
#### Create a user

```http
  POST http://localhost:8080/users
```
#### Get all messages between given two users 

```http
  POST http://localhost:8080/message/get
```

## Happy Hakcing👋🚀

