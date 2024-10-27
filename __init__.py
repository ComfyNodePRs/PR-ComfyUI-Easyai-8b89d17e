WEB_DIRECTORY = "js"
NODE_CLASS_MAPPINGS = {}
__all__ = ['NODE_CLASS_MAPPINGS']

from aiohttp import ClientSession, web
from server import PromptServer

@PromptServer.instance.routes.post("/easyai/upload_workflow")
async def upload_workflow(request):
    try:
        data = await request.json()
        url = data["domain"] + "/v1/openapi/upload/workflow"
        headers = {
            'Content-Type': 'application/json',
            'x-comfy-api-key': data["apiKey"]
        }
        async with ClientSession() as session:
            async with session.post(url, json={"workflow": data["workflow"], "name": data["name"]}, headers=headers) as resp:
                response_data = await resp.json()
                return web.json_response(response_data)

    except Exception as e:
        return web.json_response({'error': str(e)}, status=500)