Audience Connect JSON API Routes
========================================

## Overview

- /                             [`GET`]
    - register                  [`POST`]
    - users/
        - :user_id/             [`GET`]
    - invitationLists/          [`GET`, `POST`]
        - :list_id/             [`GET`, `POST`]
            - :user_id/         [`DELETE`]
    - rooms/                    [`GET`, `POST`]
        - :room_id/             [`DELETE`]
            - messages/         [`GET`, `POST`]
                - :message_id/  [`DELETE`]
            - polls             [`GET`, `POST`]
            - close             [`POST`]
    - polls/
        - :poll_id
            - vote              [`POST`]
            - close             [`POST`]

All routes return one of the following HTTP status codes:

 - `200`: success
 - `400`: bad request, if required parameters were missing or invalid
 - `401`: unauthorized, if credentials were missing or the required access level was not met
 - `500`: internal error

----------------------------------------

`GET /`

**Minimum access level:** everyone

Send the web app to the user.

----------------------------------------

`POST /register`

**Minimum access level:** everyone

Registers a new user account.

Parameters:
 - `email`: a valid email address that is not already in use
 - `password`: a string that is 1 to 32 characters long

Example request:
```json
{
	"email": "test@example.com",
	"password": "test"
}
```

----------------------------------------

`GET /users/:user_id/`

**Minimum access level:** logged_in

Returns all information for the user identified by `:user_id`.

Example response:
```json
{
	"fullName": "Johnny K",
	"avatar": "base64",
}
```

----------------------------------------

`POST /invitationLists/`

**Minimum access level:** presenter

Creates a new invitation list.

Parameters:
 - `subject`: the subject of the list

Example request:
```json
{
    "subject": "Computer Networks"
}
```

----------------------------------------

`GET /invitationLists/`

**Minimum access level:** presenter

Returns a list of all invitation lists you own.

Example response:
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

`GET /invitationLists/:list_id/`

**Minimum access level:** presenter

Returns a list of all the users who are part of the invitation list idenfitied by `:list_id`.

Example response:
```json
[
    1,
    2,
    999,
    1024
]
```

----------------------------------------

`POST /invitationLists/:list_id/`

**Minimum access level:** presenter

Adds a user to the invitation list identified by `:list_id`.

Parameters:
 - `user`: the ID of the user that should be added to the list

Example request:
```json
{
    "user_id": 10
}
```

----------------------------------------

`DELETE /invitationLists/:list_id/:user_id/`

**Minimum access level:** presenter

Remove the user identified by `:user_id` from the invitation list identified by `:list_id`.

----------------------------------------

`GET /rooms/`

**Minimum access level:** logged_in

Returns an array of all rooms you have access to.

Example response:
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

`POST /rooms/`

**Minimum access level:** presenter

Add a new chat room.

Parameters:
 - `roomName`: the name of the new room
 - `invitationList`: the ID of the list of users that will be allowed access to the room

Example request:
```json
{
	"roomName": "My Room",
	"invitationList": 12
}
```

----------------------------------------

`DELETE /rooms/:room_id/`

**Minimum access level:** presenter

Deletes the chat room identified by `:room_id`.

----------------------------------------

`GET /rooms/:room_id/messages/`

**Minimum access level:** logged_in

Gets an array of all messages sent in the room identified by `:room_id`.

Example response:
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

`POST /rooms/:room_id/messages/`

**Minimum access level:** logged_in

Sends a chat message to the room identified by `:room_id`.

Example request:
```json
{
	"message": "I like pie?"
}
```

----------------------------------------

`DELETE /rooms/:room_id/messages/:message_id/`

**Minimum access level:** presenter

Censors the message identified by `:message_id`.

----------------------------------------

`GET /rooms/:room_id/polls`

**Minimum access level:** logged_in

Gets a list of all polls in the chat room identified by `:room_id`.

Example response:
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

`POST /rooms/:room_id/polls`

**Minimum access level:** presenter

Adds a new poll to the chat room identified by `:room_id`.

Example request:
```json
{
	"question": "What is the question?",
	"answers": [
		{"id": 1, "answer": "Yes"},
		{"id": 2, "answer": "No"}
	]
}
```

----------------------------------------

`POST /rooms/:room_id/close`

**Minimum access level:** presenter

Close the chat room identified by `:room_id` so that
no more messages can be posted in it.

----------------------------------------

`POST /polls/:poll_id/vote`

**Minimum access level:** logged_in

Submits a vote in the poll identified with `:poll_id`.

Parameters:
 - `answer`: the ID of the answer you wish to vote for

Example request:
```json
{
	"answer": 2
}
```

----------------------------------------

`POST /polls/:poll_id/close`

**Minimum access level:** presenter

Close the poll identified with `:poll_id`.

----------------------------------------
