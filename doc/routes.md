Audience Connect Routes
========================================

`GET /`

Minimum access level: everyone

Send the web app to the user.

----------------------------------------

`POST /register`

Minimum access level: everyone

Registers a new user account.

```json
{
	"email",
	"password"
}
```

----------------------------------------

`GET /users/`

Minimum access level: admin

Returns a list of all users.

```json
[
	{
		"id": 12,
		"userName": "Pat Smuk",
		"accessLevel": "admin",
		"email": "patrick.smuk@uoit.net",
		"studentId": "100496078"
	}
]
```

----------------------------------------

`PUT /users/<user_id>`

Minimum access level: admin

Changes fields for a user.

```json
{
	"email": "new.email@gmail.com",
	"accessLevel": "verified"
}
```

----------------------------------------

`POST /login`

Minimum access level: everyone

Logs a user in.

```json
{
	"email",
	"password"
}
```

----------------------------------------

`GET /users/<user_id>`

Minimum access level: logged_in

Returns all information for the user with ID user_id.

```json
{
	"userName": "Johnny K",
	"avatar": "base64",
}
```

----------------------------------------

`GET /invitationLists`

Minimum access level: presenter

Returns a list of all invitation lists you own.

```json
[
	{
		"id": 1,
		"subject": "Computer Architecture"
	},
	{
		"id": 2,
		"subject": "Data Management"
	}
]
```

----------------------------------------

`GET /invitationLists/all`

Minimum access level: admin

Returns a list of **all** invitation lists.

```json
[
	{
		"id": 1,
		"subject": "Computer Architecture",
		"presenter": 120
	},
	{
		"id": 2,
		"subject": "Data Management",
		"presenter": 120
	}
]
```

----------------------------------------

`GET /invitationLists/<list_id>`

Minimum access level: presenter

Returns a list of all the users who are part of the invitation list <list_id>.

```json
[
	1,
	2,
	999,
	1024
]
```

----------------------------------------

`POST /invitationList/<list_id>/<user_id>`

Minimum access level: presenter

Adds a user to the invitation list <list_id>.

----------------------------------------

`DELETE /invitationList/<list_id>/<user_id>`

Minimum access level: presenter

Remove a user from an invitation list (<list_id>).

----------------------------------------

`GET /rooms`

Minimum access level: logged_in

Returns an array of all rooms you have access to.

```json
[
	{
		"id": 1,
		"roomName": "Pat's Room",
		"startTime": 12910291
	},
	{
		"id": 2,
		"roomName": "Other Room",
		"startTime": 123283893,
		"endTime": 12381238211
	}
]
```

----------------------------------------

`GET /rooms/all`

Minimum access level: admin

Returns an array of **all** rooms.

```json
[
	{
		"id": 1,
		"roomName": "Pat's Room",
		"startTime": 12910291,
		"invitationList": 200
	},
	{
		"id": 2,
		"roomName": "Other Room",
		"startTime": 123283893,
		"endTime": 12381238211,
		"invitationList": 1290
	}
]
```

----------------------------------------

`POST /rooms`

Minimum access level: presenter

Add a chat room.

```json
{
	"roomName": "My Room",
	"invitationList": 12
}
```

----------------------------------------

`DELETE /rooms/<room_id>`

Minimum access level: presenter

`DELETEs a chat room that you own.

----------------------------------------

`GET /rooms/<room_id>/messages`

Minimum access level: logged_in

Returns an array of all messages sent in the room.

```json
[
	{
		"id": 1,
		"sender": 12,
		"timestamp": 12812182,
		"message": "I like turtles",
		"flags": ["removed"]
	},
	{
		"id": 2,
		"sender": 16,
		"timestamp": 1281123777,
		"message": "Hello sailor!",
		"flags": ["presenter"]
	}
]
```

----------------------------------------

`POST /rooms/<room_id>/messages`

Minimum access level: logged_in

```json
{
	"message": "I like pie?"
}
```

----------------------------------------

`DELETE /rooms/<room_id>/messages/<message_id>`

Minimum access level: presenter

Censors a message in a room that you own.

----------------------------------------

`GET /rooms/<room_id>/polls`

Minimum access level: logged_in

```json
[
	{
		"id": 1,
		"startTime": 1212189182,
		"endTime": 12819281282,
		"question": "What is the biggest Mac?",
		"answers": [
			{
				"id": 1,
				"answer": "Yours"
			},
			{
				"id": 2,
				"answer": "Mine"
			}
		],
		"results": [
			{
				"id": 1,
				"votes": 10
			},
			{
				"id": 2,
				"votes": 12912929
			}
		]
	}
]
```

----------------------------------------

`POST /rooms/<room_id>/polls`

Minimum access level: presenter

```json
{
	"question": "What is the question?",
	"answers": [
		"Yes",
		"No"
	]
}
```

----------------------------------------

`POST /polls/<poll_id>/vote`

Minimum access level: logged_in

```json
{
	"answer": 2
}
```

----------------------------------------

`POST /polls/<poll_id>/close`

Minimum access level: presenter

----------------------------------------
