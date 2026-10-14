import json

log_path = r"C:\Users\Ayush\.gemini\antigravity\brain\775edd14-ec8b-4382-bff8-707fcf7046e8\.system_generated\logs\transcript.jsonl"

try:
    with open(log_path, 'r', encoding='utf-8') as f:
        for line in f:
            data = json.loads(line)
            if 'tool_calls' in data:
                for tc in data['tool_calls']:
                    if tc.get('name') == 'generate_image' or 'generate_image' in str(tc):
                        print("Found tool call:")
                        print(json.dumps(tc, indent=2))
                        print("-" * 50)
except Exception as e:
    print("Error:", e)
