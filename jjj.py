from langchain_ollama import OllamaLLM
from langchain_chroma import Chroma
from langchain_core.prompts import ChatPromptTemplate

llm = OllamaLLM(model="llama3:8b")
vectorstore = Chroma(embedding_function=SentenceTransformerEmbeddings())

async def process_query(query, user_id):
    user = await User.find_one({"_id": user_id})
    docs = vectorstore.similarity_search(query)
    prompt = ChatPromptTemplate.from_template(
        "Contexte: {context}\nProfil: {user_interests}\nQuestion: {query}\nRéponse:"
    )
    chain = prompt | llm
    response = chain.invoke({"context": docs, "user_interests": user.interests, "query": query})
    return response