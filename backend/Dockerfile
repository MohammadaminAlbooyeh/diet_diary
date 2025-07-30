# 1. Estefade az yek image rasmi Python be onvan image paye
FROM python:3.11-slim

# 2. Moshakhas kardan working directory dar dakhel container
WORKDIR /app

# 3. Copy kardan faayle pishniazi-ha be working directory
# Motmaen shid ke faayle requirements.txt ro dar poosheye backend darid.
COPY requirements.txt .

# 4. Nasb kardan pishniazi-ha
RUN pip install --no-cache-dir -r requirements.txt

# 5. Copy kardan baghiye code-haye barname be working directory
COPY . .

# 6. Moshakhas kardan porti ke barname roosh run mishe
EXPOSE 8000

# 7. Dastoor-e ejraye barname
# Farz shode ke faayle asli shoma main.py va esme app instance "app" hast.
# Age chiz-e digei hast, inja taghir bedid.
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]