/* BlogAuth V1 config/swagger.js — Swagger OpenAPI Specification Setup */
const swaggerJSDoc = require('swagger-jsdoc');

const paths = {
  "/auth/register": {
    "post": {
      "tags": ["Authentication"],
      "summary": "Register a new user account",
      "requestBody": {
        "required": true,
        "content": {
          "application/json": {
            "schema": {
              "type": "object",
              "required": ["username", "email", "password"],
              "properties": {
                "username": { "type": "string", "example": "john_doe" },
                "email": { "type": "string", "format": "email", "example": "john@example.com" },
                "password": { "type": "string", "format": "password", "example": "Password123!" }
              }
            }
          }
        }
      },
      "responses": {
        "201": {
          "description": "User registered successfully.",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "success": { "type": "boolean", "example": true },
                  "message": { "type": "string", "example": "Registration successful. Please verify your email." }
                }
              }
            }
          }
        },
        "400": { "description": "Validation error or email already in use." }
      }
    }
  },
  "/auth/login": {
    "post": {
      "tags": ["Authentication"],
      "summary": "Authenticate user and get access token",
      "requestBody": {
        "required": true,
        "content": {
          "application/json": {
            "schema": {
              "type": "object",
              "required": ["email", "password"],
              "properties": {
                "email": { "type": "string", "format": "email", "example": "john@example.com" },
                "password": { "type": "string", "format": "password", "example": "Password123!" }
              }
            }
          }
        }
      },
      "responses": {
        "200": {
          "description": "Login successful.",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "success": { "type": "boolean", "example": true },
                  "token": { "type": "string", "example": "eyJhbGciOiJIUzI1NiIsIn..." }
                }
              }
            }
          }
        },
        "401": { "description": "Invalid credentials." }
      }
    }
  },
  "/auth/logout": {
    "post": {
      "tags": ["Authentication"],
      "summary": "Log out user and clear session cookies",
      "responses": {
        "200": {
          "description": "Logout successful.",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "success": { "type": "boolean", "example": true },
                  "message": { "type": "string", "example": "Logged out successfully." }
                }
              }
            }
          }
        }
      }
    }
  },
  "/auth/me": {
    "get": {
      "tags": ["Authentication"],
      "summary": "Get authenticated user profile details",
      "security": [{ "bearerAuth": [] }],
      "responses": {
        "200": {
          "description": "User details fetched.",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "success": { "type": "boolean", "example": true },
                  "data": {
                    "type": "object",
                    "properties": {
                      "id": { "type": "string", "example": "65bfa780d6..." },
                      "username": { "type": "string", "example": "john_doe" },
                      "email": { "type": "string", "example": "john@example.com" },
                      "role": { "type": "string", "example": "author" }
                    }
                  }
                }
              }
            }
          }
        },
        "401": { "description": "Access token is missing or invalid." }
      }
    }
  },
  "/articles": {
    "get": {
      "tags": ["Articles"],
      "summary": "List all articles with filtering and pagination",
      "parameters": [
        { "name": "page", "in": "query", "schema": { "type": "integer", "default": 1 } },
        { "name": "limit", "in": "query", "schema": { "type": "integer", "default": 10 } },
        { "name": "category", "in": "query", "schema": { "type": "string" } },
        { "name": "status", "in": "query", "schema": { "type": "string", "default": "published" } }
      ],
      "responses": {
        "200": {
          "description": "Articles fetched successfully.",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "success": { "type": "boolean", "example": true },
                  "results": { "type": "array", "items": { "type": "object" } },
                  "page": { "type": "integer", "example": 1 },
                  "limit": { "type": "integer", "example": 10 },
                  "totalPages": { "type": "integer", "example": 3 },
                  "totalResults": { "type": "integer", "example": 25 }
                }
              }
            }
          }
        }
      }
    },
    "post": {
      "tags": ["Articles"],
      "summary": "Create a new article draft",
      "security": [{ "bearerAuth": [] }],
      "requestBody": {
        "required": true,
        "content": {
          "application/json": {
            "schema": {
              "type": "object",
              "required": ["title", "content"],
              "properties": {
                "title": { "type": "string", "example": "Express Web Security Guide" },
                "subtitle": { "type": "string", "example": "Best practices for node web servers" },
                "content": { "type": "string", "example": "Express apps must be secure by implementing helmet..." },
                "category": { "type": "string", "example": "65bfa780d6bc9f0012abc123" }
              }
            }
          }
        }
      },
      "responses": {
        "219": {
          "description": "Article draft created successfully.",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "success": { "type": "boolean", "example": true },
                  "message": { "type": "string", "example": "Article draft created successfully." },
                  "data": { "type": "object" }
                }
              }
            }
          }
        }
      }
    }
  },
  "/articles/{id}": {
    "get": {
      "tags": ["Articles"],
      "summary": "Retrieve a single article by ID",
      "parameters": [
        { "name": "id", "in": "path", "required": true, "schema": { "type": "string" } }
      ],
      "responses": {
        "200": { "description": "Article details returned." },
        "404": { "description": "Article not found." }
      }
    },
    "put": {
      "tags": ["Articles"],
      "summary": "Update an article content or metadata",
      "security": [{ "bearerAuth": [] }],
      "parameters": [
        { "name": "id", "in": "path", "required": true, "schema": { "type": "string" } }
      ],
      "requestBody": {
        "required": true,
        "content": {
          "application/json": {
            "schema": {
              "type": "object",
              "properties": {
                "title": { "type": "string" },
                "content": { "type": "string" }
              }
            }
          }
        }
      },
      "responses": {
        "200": { "description": "Article saved successfully." }
      }
    },
    "delete": {
      "tags": ["Articles"],
      "summary": "Delete an article",
      "security": [{ "bearerAuth": [] }],
      "parameters": [
        { "name": "id", "in": "path", "required": true, "schema": { "type": "string" } }
      ],
      "responses": {
        "200": { "description": "Article deleted." }
      }
    }
  },
  "/articles/{id}/publish": {
    "post": {
      "tags": ["Articles"],
      "summary": "Publish draft article immediately",
      "security": [{ "bearerAuth": [] }],
      "parameters": [
        { "name": "id", "in": "path", "required": true, "schema": { "type": "string" } }
      ],
      "responses": {
        "200": { "description": "Article published successfully." }
      }
    }
  },
  "/dashboard": {
    "get": {
      "tags": ["Dashboard"],
      "summary": "Retrieve aggregated workspace statistics & activities",
      "security": [{ "bearerAuth": [] }],
      "responses": {
        "200": {
          "description": "Dashboard data compiled.",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "success": { "type": "boolean", "example": true },
                  "publishedCount": { "type": "integer", "example": 5 },
                  "viewsCount": { "type": "integer", "example": 150 },
                  "bookmarks": { "type": "array", "items": { "type": "object" } }
                }
              }
            }
          }
        }
      }
    }
  },
  "/users/avatar": {
    "post": {
      "tags": ["Users"],
      "summary": "Upload user avatar profile image",
      "security": [{ "bearerAuth": [] }],
      "requestBody": {
        "content": {
          "multipart/form-data": {
            "schema": {
              "type": "object",
              "properties": {
                "avatar": { "type": "string", "format": "binary" }
              }
            }
          }
        }
      },
      "responses": {
        "200": { "description": "Avatar uploaded and profile updated." }
      }
    }
  },
  "/comments": {
    "post": {
      "tags": ["Comments"],
      "summary": "Post a new comment on an article",
      "security": [{ "bearerAuth": [] }],
      "requestBody": {
        "required": true,
        "content": {
          "application/json": {
            "schema": {
              "type": "object",
              "required": ["article", "content"],
              "properties": {
                "article": { "type": "string", "example": "65bfa780d6..." },
                "content": { "type": "string", "example": "Great article, very insightful!" },
                "parentComment": { "type": "string", "example": "65bfb321..." }
              }
            }
          }
        }
      },
      "responses": {
        "201": { "description": "Comment posted successfully." }
      }
    }
  },
  "/comments/article/{articleId}": {
    "get": {
      "tags": ["Comments"],
      "summary": "Get all comments for an article",
      "parameters": [
        { "name": "articleId", "in": "path", "required": true, "schema": { "type": "string" } }
      ],
      "responses": {
        "200": { "description": "Comments list retrieved." }
      }
    }
  },
  "/bookmarks": {
    "post": {
      "tags": ["Bookmarks"],
      "summary": "Toggle article bookmark status",
      "security": [{ "bearerAuth": [] }],
      "requestBody": {
        "required": true,
        "content": {
          "application/json": {
            "schema": {
              "type": "object",
              "required": ["article"],
              "properties": {
                "article": { "type": "string", "example": "65bfa780d6..." }
              }
            }
          }
        }
      },
      "responses": {
        "200": { "description": "Bookmark toggled successfully." }
      }
    },
    "get": {
      "tags": ["Bookmarks"],
      "summary": "Get user bookmarks list",
      "security": [{ "bearerAuth": [] }],
      "responses": {
        "200": { "description": "Bookmarks list retrieved." }
      }
    }
  },
  "/likes": {
    "post": {
      "tags": ["Likes"],
      "summary": "Toggle article like status",
      "security": [{ "bearerAuth": [] }],
      "requestBody": {
        "required": true,
        "content": {
          "application/json": {
            "schema": {
              "type": "object",
              "required": ["article"],
              "properties": {
                "article": { "type": "string", "example": "65bfa780d6..." }
              }
            }
          }
        }
      },
      "responses": {
        "200": { "description": "Like toggled successfully." }
      }
    }
  },
  "/media/upload-cover": {
    "post": {
      "tags": ["Media"],
      "summary": "Upload article cover image to Cloudinary or Local filesystem",
      "security": [{ "bearerAuth": [] }],
      "requestBody": {
        "content": {
          "multipart/form-data": {
            "schema": {
              "type": "object",
              "properties": {
                "image": { "type": "string", "format": "binary" }
              }
            }
          }
        }
      },
      "responses": {
        "200": { "description": "Cover image uploaded successfully." }
      }
    }
  },
  "/notifications": {
    "get": {
      "tags": ["Notifications"],
      "summary": "Get logged in user notifications",
      "security": [{ "bearerAuth": [] }],
      "responses": {
        "200": { "description": "Notifications retrieved." }
      }
    }
  },
  "/reports": {
    "post": {
      "tags": ["Reports"],
      "summary": "File a report against inappropriate content",
      "security": [{ "bearerAuth": [] }],
      "requestBody": {
        "required": true,
        "content": {
          "application/json": {
            "schema": {
              "type": "object",
              "required": ["type", "targetId", "reason"],
              "properties": {
                "type": { "type": "string", "enum": ["article", "comment"], "example": "article" },
                "targetId": { "type": "string", "example": "65bfa780d6..." },
                "reason": { "type": "string", "enum": ["spam", "harassment", "rules", "plagiarism", "other"], "example": "spam" }
              }
            }
          }
        }
      },
      "responses": {
        "201": { "description": "Report filed successfully." }
      }
    }
  },
  "/admin/users": {
    "get": {
      "tags": ["Admin"],
      "summary": "List all registered user accounts (admin privilege required)",
      "security": [{ "bearerAuth": [] }],
      "responses": {
        "200": { "description": "User accounts returned." }
      }
    }
  }
};

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'BlogAuth API Reference',
      version: '1.0.0',
      description: 'Interactive API reference documentation for the BlogAuth digital journal server backend pipeline.',
      contact: {
        name: 'BlogAuth Engineering Support'
      }
    },
    servers: [
      {
        url: '/api/v1',
        description: 'V1 API Root Prefix'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT access token below (e.g. Bearer <token>).'
        },
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'jwt',
          description: 'Authenticate using cookies.'
        }
      }
    },
    security: [
      {
        bearerAuth: []
      },
      {
        cookieAuth: []
      }
    ],
    paths: paths
  },
  apis: []
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
