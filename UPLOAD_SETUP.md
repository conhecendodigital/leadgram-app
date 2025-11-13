# 📤 Setup da Funcionalidade de Upload

## ⚙️ Configuração Necessária no Supabase

Para que a funcionalidade de upload funcione corretamente, você precisa criar um **Storage Bucket** no Supabase.

### Passo a passo:

1. **Acesse o painel do Supabase**
   - Vá em https://supabase.com/dashboard
   - Selecione seu projeto

2. **Criar o Bucket "content"**
   - No menu lateral, clique em **Storage**
   - Clique em **"New Bucket"**
   - Nome do bucket: `content`
   - **Public bucket**: ✅ SIM (marque como público)
   - Clique em **Create bucket**

3. **Configurar Políticas de Acesso (RLS)**

   Após criar o bucket, configure as políticas:

   **Policy 1: Upload (INSERT)**
   ```sql
   CREATE POLICY "Users can upload their own content"
   ON storage.objects FOR INSERT
   WITH CHECK (
     bucket_id = 'content'
     AND (storage.foldername(name))[1] = auth.uid()::text
   );
   ```

   **Policy 2: Download (SELECT)**
   ```sql
   CREATE POLICY "Public can view content"
   ON storage.objects FOR SELECT
   USING (bucket_id = 'content');
   ```

   **Policy 3: Delete (DELETE)**
   ```sql
   CREATE POLICY "Users can delete their own content"
   ON storage.objects FOR DELETE
   USING (
     bucket_id = 'content'
     AND (storage.foldername(name))[1] = auth.uid()::text
   );
   ```

4. **Validar Configuração**
   - Tente fazer upload de um arquivo pela aplicação
   - Verifique se o arquivo aparece em Storage > content
   - Teste se o preview funciona

---

## 📁 Estrutura de Arquivos

Os arquivos serão salvos com a seguinte estrutura:

```
content/
└── uploads/
    └── {user_id}/
        └── {timestamp}.{ext}
```

**Exemplo:**
```
content/uploads/550e8400-e29b-41d4-a716-446655440000/1704567890123.mp4
```

---

## 🎯 Tipos de Arquivo Aceitos

### Vídeos:
- MP4 (video/mp4)
- MOV (video/quicktime)
- WEBM (video/webm)

### Imagens:
- JPG/JPEG (image/jpeg)
- PNG (image/png)
- GIF (image/gif)
- WEBP (image/webp)

**Tamanho máximo:** 100MB por arquivo

---

## ✅ Campos Adicionados

### Tabela `ideas`:
- `thumbnail_url` (text, nullable) - URL da imagem/thumbnail
- `video_url` (text, nullable) - URL do vídeo

**Nota:** Esses campos já existem na tabela. Caso não existam, adicione com:

```sql
ALTER TABLE ideas
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT,
ADD COLUMN IF NOT EXISTS video_url TEXT;
```

---

## 🚀 Como Usar

1. Acesse `/dashboard/upload`
2. Clique na área de upload ou arraste um arquivo
3. Preencha as informações (título, tema, etc.)
4. Clique em "Fazer Upload"
5. Aguarde o upload e criação automática da ideia
6. Você será redirecionado para a lista de ideias

---

## 🐛 Troubleshooting

### Erro: "Error uploading file"
- Verifique se o bucket "content" existe
- Verifique se o bucket está marcado como público
- Verifique se as políticas RLS estão configuradas

### Erro: "File too large"
- O arquivo não pode exceder 100MB
- Comprima o vídeo antes de fazer upload

### Preview não aparece
- Verifique se o bucket está público
- Verifique a URL gerada no console do navegador

---

## 📊 Status do Upload

Quando um arquivo é enviado via upload:
- **Status da ideia:** Automaticamente marcada como `"recorded"` (gravado)
- **Motivo:** Já existe um arquivo associado à ideia

Isso ajuda a organizar o fluxo: Ideia → Gravado → Postado
