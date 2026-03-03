import 'package:flutter/material.dart';
import 'package:google_generative_ai/google_generative_ai.dart';

// --- 1. AI SERVICE LAYER ---
class RecipeService {
  // ⚠️ PASTE YOUR API KEY HERE
  static const String _apiKey = "AIzaSyAQK8Pc3q1AzrP6eq_iU0uVoMQm4oekaP0"; 

  final model = GenerativeModel(
    model: 'gemini-2.5-flash',
    apiKey: _apiKey,
  );

  Future<String> generateRecipe({
    required List<String> ingredients,
    required String allergies,
    required String preference,
  }) async {
    final prompt = """
      Act as a Professional Michelin Star Chef. 
      Ingredients: ${ingredients.join(', ')}.
      Allergies to avoid: $allergies.
      Preference: $preference.

      Format the response beautifully:
      - 🍽️ Dish Name (Bold)
      - ⏱️ Time: [X] mins
      - 🛒 Ingredients Used
      - 👨‍🍳 Step-by-Step Instructions
      
      Rules: No weird combos. If it's dangerous or impossible, explain why.
    """;

    final content = [Content.text(prompt)];
    final response = await model.generateContent(content);
    return response.text ?? "Chef is offline! Check your connection.";
  }
}

// --- 2. MAIN DASHBOARD ---
class RecipeDashboard extends StatefulWidget {
  @override
  _RecipeDashboardState createState() => _RecipeDashboardState();
}

class _RecipeDashboardState extends State<RecipeDashboard> {
  final List<String> _ingredients = [];
  final TextEditingController _ingredientController = TextEditingController();
  final TextEditingController _allergyController = TextEditingController();
  String _selectedPreference = "None";

  void _getRecipe() async {
    if (_ingredients.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text("Please add at least one ingredient!")),
      );
      return;
    }

    // Show Loading Dialog
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            CircularProgressIndicator(color: Colors.orange),
            SizedBox(height: 16),
            Text("Chef is thinking... 🧑‍🍳"),
          ],
        ),
      ),
    );

    try {
      final recipe = await RecipeService().generateRecipe(
        ingredients: _ingredients,
        allergies: _allergyController.text,
        preference: _selectedPreference,
      );

      Navigator.pop(context); // Remove loading dialog

      // Navigate to Results
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (context) => RecipeResultScreen(recipeText: recipe),
        ),
      );
    } catch (e) {
      Navigator.pop(context);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text("Error: $e")),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text("AI Chef Dashboard"), backgroundColor: Colors.orange),
      body: SingleChildScrollView(
        padding: EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text("Any Allergies?", style: TextStyle(fontWeight: FontWeight.bold)),
            TextField(
              controller: _allergyController,
              decoration: InputDecoration(hintText: "e.g. Peanuts, Dairy"),
            ),
            SizedBox(height: 20),
            Text("Add Ingredients:", style: TextStyle(fontWeight: FontWeight.bold)),
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _ingredientController,
                    decoration: InputDecoration(hintText: "e.g. Tomato"),
                  ),
                ),
                IconButton(
                  icon: Icon(Icons.add_circle, color: Colors.orange),
                  onPressed: () {
                    if (_ingredientController.text.isNotEmpty) {
                      setState(() {
                        _ingredients.add(_ingredientController.text);
                        _ingredientController.clear();
                      });
                    }
                  },
                ),
              ],
            ),
            Wrap(
              spacing: 8,
              children: _ingredients.map((i) => Chip(
                label: Text(i),
                onDeleted: () => setState(() => _ingredients.remove(i)),
              )).toList(),
            ),
            SizedBox(height: 30),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.orange,
                minimumSize: Size(double.infinity, 50),
              ),
              onPressed: _getRecipe,
              child: Text("GENERATE DISH ✨", style: TextStyle(color: Colors.white)),
            ),
          ],
        ),
      ),
    );
  }
}

// --- 3. RESULT SCREEN ---
class RecipeResultScreen extends StatelessWidget {
  final String recipeText;
  const RecipeResultScreen({required this.recipeText});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text("Chef's Suggestion"), backgroundColor: Colors.orange),
      body: SingleChildScrollView(
        padding: EdgeInsets.all(20),
        child: Card(
          elevation: 5,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
          child: Padding(
            padding: EdgeInsets.all(15),
            child: Text(recipeText, style: TextStyle(fontSize: 16, height: 1.6)),
          ),
        ),
      ),
    );
  }
}