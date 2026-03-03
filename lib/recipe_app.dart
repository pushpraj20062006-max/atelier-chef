import 'package:flutter/material.dart';
import 'package:google_generative_ai/google_generative_ai.dart';

// --- 1. AI SERVICE (The Brain) ---
class RecipeService {
  // ⚠️ PASTE YOUR API KEY HERE
  static const String _apiKey = "AIzaSyAQK8Pc3q1AzrP6eq_iU0uVoMQm4oekaP0"; 

  final model = GenerativeModel(
    model: 'gemini-2.5-flash',
    apiKey: _apiKey,
  );

  // This will store the conversation context
  ChatSession? _chatSession;

  Future<String> generateInitialRecipe({
    required List<String> ingredients,
    required String allergies,
  }) async {
    final prompt = """
      Act as a Professional Chef. 
      Ingredients: ${ingredients.join(', ')}.
      Strict Allergies: $allergies.
      
      Suggest ONE delicious dish. Include:
      1. Dish Name
      2. Prep Time
      3. Step-by-step instructions.
      Avoid weird combinations.
    """;

    // Start a new chat session with this prompt
    _chatSession = model.startChat();
    final response = await _chatSession!.sendMessage(Content.text(prompt));
    return response.text ?? "Chef couldn't think of anything!";
  }

  Future<String> askFollowUp(String question) async {
    if (_chatSession == null) return "Please generate a recipe first.";
    final response = await _chatSession!.sendMessage(Content.text(question));
    return response.text ?? "Chef is busy!";
  }
}

// --- 2. MAIN DASHBOARD SCREEN ---
class RecipeDashboard extends StatefulWidget {
  const RecipeDashboard({super.key});

  @override
  State<RecipeDashboard> createState() => _RecipeDashboardState();
}

class _RecipeDashboardState extends State<RecipeDashboard> {
  final List<String> _ingredients = [];
  final _ingredientController = TextEditingController();
  final _allergyController = TextEditingController();
  final RecipeService _service = RecipeService();

  void _generateRecipe() async {
    if (_ingredients.isEmpty) return;

    // Show loading
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => const Center(child: CircularProgressIndicator(color: Colors.orange)),
    );

    try {
      final result = await _service.generateInitialRecipe(
        ingredients: _ingredients,
        allergies: _allergyController.text,
      );
      Navigator.pop(context); // Close loading

      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (context) => RecipeChatScreen(initialRecipe: result, service: _service),
        ),
      );
    } catch (e) {
      Navigator.pop(context);
      print("Error: $e");
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("AI Kitchen Assistant"), backgroundColor: Colors.orange),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            TextField(controller: _allergyController, decoration: const InputDecoration(labelText: "Allergies (e.g. Nuts)")),
            const SizedBox(height: 20),
            Row(
              children: [
                Expanded(child: TextField(controller: _ingredientController, decoration: const InputDecoration(labelText: "Add Ingredient"))),
                IconButton(icon: const Icon(Icons.add), onPressed: () {
                  setState(() => _ingredients.add(_ingredientController.text));
                  _ingredientController.clear();
                }),
              ],
            ),
            Wrap(children: _ingredients.map((i) => Chip(label: Text(i))).toList()),
            const Spacer(),
            ElevatedButton(
              style: ElevatedButton.styleFrom(backgroundColor: Colors.orange, minimumSize: const Size(double.infinity, 50)),
              onPressed: _generateRecipe, 
              child: const Text("COOK SOMETHING! ✨", style: TextStyle(color: Colors.white))
            ),
          ],
        ),
      ),
    );
  }
}

// --- 3. INTERACTIVE CHAT SCREEN ---
class RecipeChatScreen extends StatefulWidget {
  final String initialRecipe;
  final RecipeService service;
  const RecipeChatScreen({super.key, required this.initialRecipe, required this.service});

  @override
  State<RecipeChatScreen> createState() => _RecipeChatScreenState();
}

class _RecipeChatScreenState extends State<RecipeChatScreen> {
  late List<Map<String, String>> messages;
  final _chatController = TextEditingController();

  @override
  void initState() {
    super.initState();
    messages = [{"role": "chef", "text": widget.initialRecipe}];
  }

  void _sendMessage() async {
    final text = _chatController.text;
    if (text.isEmpty) return;

    setState(() {
      messages.add({"role": "user", "text": text});
      _chatController.clear();
    });

    final reply = await widget.service.askFollowUp(text);
    setState(() => messages.add({"role": "chef", "text": reply}));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Chat with Chef"), backgroundColor: Colors.orange),
      body: Column(
        children: [
          Expanded(
            child: ListView.builder(
              itemCount: messages.length,
              itemBuilder: (context, i) => Container(
                margin: const EdgeInsets.all(8),
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: messages[i]["role"] == "user" ? Colors.blue[50] : Colors.orange[50],
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Text(messages[i]["text"]!),
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(8.0),
            child: Row(
              children: [
                Expanded(child: TextField(controller: _chatController)),
                IconButton(icon: const Icon(Icons.send), onPressed: _sendMessage),
              ],
            ),
          )
        ],
      ),
    );
  }
}