export const app_constants = {
    ACCESS_TOKEN_EXPIRY: '2h',
    REFRESH_TOKEN_EXPIRY: '30d'
}

export const health_check_html = `
    <!doctype html>
    <html>
      <head>
        <title>Pistis Trybe API</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter&display=swap"
          rel="stylesheet"
        />
        <style>
          body {
            font-family: "Inter", sans-serif;
            text-align: center;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
          }
          .container {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            padding: 40px;
            border-radius: 20px;
            box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
            border: 1px solid rgba(255, 255, 255, 0.18);
            max-width: 600px;
            margin: 20px;
          }
          h1 {
            font-size: 2.5em;
            margin-bottom: 20px;
            color: white;
          }
          p {
            font-size: 1.2em;
            margin-bottom: 30px;
            color: rgba(255, 255, 255, 0.9);
          }
          .button {
            display: inline-block;
            padding: 15px 30px;
            background: white;
            color: #667eea;
            text-decoration: none;
            border-radius: 50px;
            font-weight: 600;
            font-size: 1.1em;
            transition: transform 0.2s, box-shadow 0.2s;
            border: none;
            cursor: pointer;
            margin: 10px;
          }
          .button:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
          }
          .button.secondary {
            background: transparent;
            color: white;
            border: 2px solid white;
          }
          .button.secondary:hover {
            background: rgba(255, 255, 255, 0.1);
          }
          .status {
            margin-top: 20px;
            font-size: 0.9em;
            color: rgba(255, 255, 255, 0.7);
          }
          .status span {
            color: #4caf50;
            font-weight: 600;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🚀 Pistis Trybe API</h1>
          <p>Welcome to the Pistis Trybe REST API! Your gateway to seamless integration.</p>
          
          <div>
            <a href="/v1/swagger/docs" class="button">📚 View Documentation</a>
          </div>
          
          <div class="status">
            <span>●</span> API Status: Operational <span>●</span> Version: 1.0.0
          </div>
        </div>
      </body>
    </html>
  `;