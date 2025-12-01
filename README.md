# multiagentBasket
An AI multiagent basketball environment in python and react to decide the lineup. This is a python backend using fastapi, smolagents and ollama and a react fronted to show the information generated.

# backend
To get the backend ready you need to install a couple of packages:

    python3 -m pip install smolagents   
    python3 -m pip install ollama   
    pip install fastapi uvicorn sse-starlette

Also download a llm, the selected one was qwen2.5:14b to have a longer token capabilities:

    ollama pull qwen2.5:14b

With this you can start the api with: 
    
    cd backend
    uvicorn api:app --host 0.0.0.0 --port 8000 --reload

# fronted
Its a react applucation so open a new terminal and go to the fronted folder:

    cd fronted
    npm install react-markdown remark-gfm
    #npm install framer-motion recharts
    npm start

For information, send an email to p.camacho.j@gmail.com